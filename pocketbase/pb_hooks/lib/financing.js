const MAX_RATE = 1000;
const FIELDS = ["financed_amount", "tin", "tae", "opening_fee"];

module.exports = {
	defaults: { financed_amount: -0, tin: -0, tae: -0, opening_fee: -0 },
	validate(data) {
		if (
			FIELDS.some((name) => data[name] < 0) ||
			data.tin > MAX_RATE ||
			data.tae > MAX_RATE
		) {
			throw new BadRequestError("Invalid financing details");
		}
	},
	apply(debt, data) {
		for (const name of FIELDS) debt.set(name, data[name]);
	},
};
