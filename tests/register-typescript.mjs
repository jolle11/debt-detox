import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url);
registerHooks({
	resolve(specifier, context, nextResolve) {
		const candidate = specifier.startsWith("@/")
			? new URL(specifier.slice(2), root)
			: specifier.startsWith(".") && context.parentURL
				? new URL(specifier, context.parentURL)
				: null;
		if (candidate?.protocol === "file:") {
			const path = fileURLToPath(candidate);
			if (existsSync(`${path}.ts`)) {
				return nextResolve(pathToFileURL(`${path}.ts`).href, context);
			}
		}
		return nextResolve(specifier, context);
	},
});
