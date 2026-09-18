import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import ts from "typescript";

// Execute the actual control handlers and hook together, with an intentionally
// delayed profile response. JSX is inspected without requiring a DOM renderer.
const mocks = {
	"@/components/ui/PrivateAmount": "export default function PrivateAmount() {}",
	"@phosphor-icons/react":
		'export const CaretDownIcon = "caret"; export const UsersThreeIcon = "users";',
	"@/hooks/useCurrency":
		"export const useCurrency = () => ({formatCurrency: x => `${x} EUR`});",
	"@/i18n/routing": 'export const Link = "a";',
	...Object.fromEntries(
		[
			"./DebtActions",
			"./DebtInfo",
			"./DebtPaymentStatus",
			"./DebtProgressWithPayments",
		].map((name) => [name, "export default function Child() {}"]),
	),
	"react/jsx-runtime":
		"export const jsx = (type, props) => ({type,props}); export const jsxs = jsx; export const Fragment = 0;",
	react:
		'export const useId = () => "sort-control"; export const useMemo = f => f(); export const useState = x => [x, () => {}];',
	"next-intl":
		'export const useTranslations = () => key => key; export const useLocale = () => "es";',
	sonner: "export const toast = { error: () => {} };",
	"@/contexts/AuthContext":
		"export const useAuth = () => globalThis.__sortAuth;",
};
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (mocks[specifier])
			return {
				url: `data:text/javascript,${encodeURIComponent(mocks[specifier])}`,
				shortCircuit: true,
			};
		return nextResolve(specifier, context);
	},
	load(url, context, nextLoad) {
		if (url.startsWith("data:text/javascript,"))
			return {
				format: "module",
				shortCircuit: true,
				source: decodeURIComponent(url.slice("data:text/javascript,".length)),
			};
		if (url.endsWith(".tsx"))
			return {
				format: "module",
				shortCircuit: true,
				source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
					compilerOptions: {
						jsx: ts.JsxEmit.ReactJSX,
						module: ts.ModuleKind.ESNext,
						target: ts.ScriptTarget.ES2022,
					},
				}).outputText,
			};
		return nextLoad(url, context);
	},
});
const { default: DebtSortControl } = await import(
	"../../components/dashboard/DebtSortControl.tsx"
);
const { useDebtSorting } = await import("../../hooks/useDebtSorting.ts");
const { DEBT_SORT_KEYS, DEFAULT_SORT_DIRECTIONS } = await import(
	"../../lib/debtSorting.ts"
);
function selects(node) {
	if (!node || typeof node !== "object") return [];
	if (Array.isArray(node)) return node.flatMap(selects);
	return [
		...(node.type === "select" ? [node] : []),
		...selects(node.props?.children),
	];
}
function harness() {
	const user = { debt_sort_by: "remaining", debt_sort_direction: "desc" };
	const writes = [];
	const pending = [];
	globalThis.__sortAuth = {
		user,
		savingDebtSort: false,
		savePreferences: (updates) => {
			writes.push(updates);
			return new Promise((resolve) =>
				pending.push(() => {
					Object.assign(user, updates);
					resolve();
				}),
			);
		},
	};
	const render = () => {
		const hook = useDebtSorting([], []);
		return selects(
			DebtSortControl({
				preference: hook.preference,
				isSaving: hook.isSaving,
				onChange: hook.saveSort,
			}),
		);
	};
	const flush = async () => {
		while (pending.length) {
			pending.shift()();
			await Promise.resolve();
		}
	};
	return { user, writes, render, flush };
}
for (const criterion of DEBT_SORT_KEYS) {
	test(`direction changes preserve ${criterion} before the previous save resolves`, async () => {
		const h = harness();
		const [by, direction] = h.render();
		by.props.onChange({ target: { value: criterion } });
		direction.props.onChange({ target: { value: "asc" } });
		direction.props.onChange({ target: { value: "desc" } });
		await h.flush();
		assert.equal(h.user.debt_sort_by, criterion);
		assert.equal(h.user.debt_sort_direction, "desc");
		assert.deepEqual(h.writes[1], { debt_sort_direction: "asc" });
		const [savedBy, savedDirection] = h.render();
		assert.equal(savedBy.props.value, criterion);
		assert.equal(savedDirection.props.value, "desc");
	});
	test(`changing to ${criterion} applies its default direction`, async () => {
		const h = harness();
		h.render()[0].props.onChange({ target: { value: criterion } });
		await h.flush();
		assert.equal(h.user.debt_sort_by, criterion);
		assert.equal(
			h.user.debt_sort_direction,
			DEFAULT_SORT_DIRECTIONS[criterion],
		);
	});
}

const { default: DebtCard } = await import(
	"../../components/dashboard/DebtCard.tsx"
);
function text(node) {
	if (node == null || typeof node === "boolean") return "";
	if (Array.isArray(node)) return node.map(text).join(" ");
	if (typeof node === "object") return text(node.props?.children);
	return String(node);
}
for (const linked of [false, true]) {
	test(`monthly cards keep the monthly amount in both directions (linked: ${linked})`, async () => {
		const h = harness();
		h.render()[0].props.onChange({ target: { value: "monthly" } });
		await h.flush();
		const debt = {
			id: "a",
			name: "Loan",
			user_id: "owner",
			monthly_amount: 100,
			number_of_payments: 12,
			first_payment_date: "2026-01-01",
			collaborator_id: linked ? "partner" : undefined,
		};
		for (const dir of ["desc", "asc"]) {
			h.render()[1].props.onChange({ target: { value: dir } });
			await h.flush();
			const hook = useDebtSorting([debt], []);
			const card = text(
				DebtCard({
					debt,
					payments: [],
					sortBy: hook.preference.by,
					onMarkPaymentAsPaid: async () => {},
				}),
			);
			assert.ok(card.includes(linked ? "50 EUR" : "100 EUR"), card);
			assert.ok(
				card.includes(
					linked ? "collaboration.yourMonthly" : "dashboard.debt.monthlyAmount",
				),
				card,
			);
			assert.ok(!card.includes("remainingAmount"), card);
		}
	});
}
