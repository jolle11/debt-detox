const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value) {
	return value < 10 ? `0${value}` : String(value);
}

function daysInMonth(year, month) {
	const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	return [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
		month - 1
	];
}

function isDateOnly(value) {
	const match = DATE_ONLY_PATTERN.exec(String(value || ""));
	if (!match) return false;
	const year = parseInt(match[1], 10);
	const month = parseInt(match[2], 10);
	const day = parseInt(match[3], 10);
	return (
		year >= 2000 &&
		year <= 9999 &&
		month >= 1 &&
		month <= 12 &&
		day >= 1 &&
		day <= daysInMonth(year, month)
	);
}

function addMonthsToDateOnly(dateValue, monthOffset) {
	const dateOnly = String(dateValue).slice(0, 10);
	const year = parseInt(dateOnly.slice(0, 4), 10);
	const month = parseInt(dateOnly.slice(5, 7), 10);
	const day = parseInt(dateOnly.slice(8, 10), 10);
	const totalMonths = year * 12 + (month - 1) + monthOffset;
	const targetYear = Math.floor(totalMonths / 12);
	const targetMonth = (totalMonths % 12) + 1;
	const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
	return `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`;
}

// The client sends its local calendar date so "today" matches the user's
// timezone. Accept it only within one day of the server's UTC date.
function today(e) {
	const utcToday = new Date().toISOString().slice(0, 10);
	const clientDate = e.request.header.get("X-Client-Date");
	if (!isDateOnly(clientDate)) return utcToday;
	const diff = Math.abs(
		new Date(`${clientDate}T00:00:00Z`).getTime() -
			new Date(`${utcToday}T00:00:00Z`).getTime(),
	);
	return diff <= DAY_MS ? clientDate : utcToday;
}

function periodOf(year, month) {
	return `${year}-${pad(month)}`;
}

// Returns the date of the separate final payment, or "" when there is none.
function finalPaymentDate(debt) {
	if (!((debt.get("final_payment") || 0) > 0)) return "";
	const firstDate = debt.getString("first_payment_date");
	const paymentCount = debt.get("number_of_payments");
	const lastMonthlyDate = addMonthsToDateOnly(
		firstDate,
		Math.max(paymentCount - 1, 0),
	);
	const configuredFinalDate = debt.getString("final_payment_date").slice(0, 10);
	return configuredFinalDate > lastMonthlyDate
		? configuredFinalDate
		: addMonthsToDateOnly(firstDate, paymentCount);
}

module.exports = {
	addMonthsToDateOnly,
	daysInMonth,
	finalPaymentDate,
	isDateOnly,
	pad,
	periodOf,
	today,
};
