import process from "node:process";
import PocketBase from "pocketbase";

const DEFAULT_URL = "https://debtdetoxbackend.up.railway.app";

function readLine(label, { secret = false, defaultValue = "" } = {}) {
	return new Promise((resolve, reject) => {
		const input = process.stdin;
		const output = process.stdout;
		let value = "";

		if (!input.isTTY) {
			reject(new Error("This command requires an interactive terminal."));
			return;
		}

		output.write(`${label}${defaultValue ? ` [${defaultValue}]` : ""}: `);
		input.setRawMode(true);
		input.resume();
		input.setEncoding("utf8");

		const cleanup = () => {
			input.off("data", onData);
			input.setRawMode(false);
			input.pause();
		};

		const onData = (character) => {
			if (character === "\u0003") {
				cleanup();
				output.write("\n");
				reject(new Error("Cancelled."));
				return;
			}

			if (character === "\r" || character === "\n") {
				cleanup();
				output.write("\n");
				resolve(value || defaultValue);
				return;
			}

			if (character === "\u007f" || character === "\b") {
				if (value.length > 0) {
					value = value.slice(0, -1);
					output.write("\b \b");
				}
				return;
			}

			if (character >= " ") {
				value += character;
				output.write(secret ? "*" : character);
			}
		};

		input.on("data", onData);
	});
}

async function main() {
	console.log("Reset a PocketBase users record password\n");

	const baseUrl = await readLine("PocketBase URL", { defaultValue: DEFAULT_URL });
	const superuserEmail = await readLine("Superuser email");
	const superuserPassword = await readLine("Superuser password", { secret: true });
	const userEmail = await readLine("Application user email");
	const newPassword = await readLine("New user password", { secret: true });
	const passwordConfirm = await readLine("Confirm new user password", { secret: true });

	if (newPassword.length < 8) {
		throw new Error("The new password must contain at least 8 characters.");
	}
	if (newPassword !== passwordConfirm) {
		throw new Error("The new passwords do not match.");
	}

	const pb = new PocketBase(baseUrl.replace(/\/$/, ""));
	pb.autoCancellation(false);

	await pb.collection("_superusers").authWithPassword(
		superuserEmail.trim(),
		superuserPassword,
	);

	const user = await pb.collection("users").getFirstListItem(
		pb.filter("email = {:email}", { email: userEmail.trim().toLowerCase() }),
	);

	await pb.collection("users").update(user.id, {
		password: newPassword,
		passwordConfirm,
	});

	pb.authStore.clear();
	console.log(`Password updated for users record ${user.id}.`);
}

main().catch((error) => {
	console.error(`Password reset failed: ${error?.message || error}`);
	process.exitCode = 1;
});
