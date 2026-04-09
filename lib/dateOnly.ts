const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/;

function pad(value: number): string {
	return value.toString().padStart(2, "0");
}

function isValidLocalDate(
	date: Date,
	year: number,
	month: number,
	day: number,
) {
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
}

export function formatDateOnly(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateOnly(dateString: string): Date | null {
	if (!dateString) return null;

	const normalized = dateString.trim();
	const dateOnlyMatch = DATE_ONLY_PATTERN.exec(normalized);

	if (dateOnlyMatch) {
		const year = Number.parseInt(dateOnlyMatch[1], 10);
		const month = Number.parseInt(dateOnlyMatch[2], 10);
		const day = Number.parseInt(dateOnlyMatch[3], 10);
		const localDate = new Date(year, month - 1, day);

		if (isValidLocalDate(localDate, year, month, day)) {
			return localDate;
		}
	}

	const parsedDate = new Date(normalized);
	if (Number.isNaN(parsedDate.getTime())) {
		return null;
	}

	return new Date(
		parsedDate.getFullYear(),
		parsedDate.getMonth(),
		parsedDate.getDate(),
	);
}

export function normalizeDateOnlyString(dateString: string): string {
	const date = parseDateOnly(dateString);
	return date ? formatDateOnly(date) : "";
}

export function addMonthsToDateOnly(
	dateString: string,
	monthOffset: number,
): string {
	const date = parseDateOnly(dateString);
	if (!date) {
		throw new Error(`Invalid date-only value: ${dateString}`);
	}

	date.setMonth(date.getMonth() + monthOffset);
	return formatDateOnly(date);
}

export function getTodayDateOnly(now: Date = new Date()): string {
	return formatDateOnly(now);
}

export function compareDateOnlyStrings(a: string, b: string): number {
	const left = parseDateOnly(a);
	const right = parseDateOnly(b);

	if (!left || !right) {
		throw new Error(`Invalid date-only comparison: ${a}, ${b}`);
	}

	return left.getTime() - right.getTime();
}
