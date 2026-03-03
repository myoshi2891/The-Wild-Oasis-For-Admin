import { formatDistance, parseISO, differenceInDays } from "date-fns";

// We want to make this function work for both Date objects and strings (which come from Supabase)
const toDate = (d: string | Date): Date =>
	d instanceof Date ? d : parseISO(String(d));

export const subtractDates = (
date1: string | Date,
date2: string | Date
): number => differenceInDays(toDate(date1), toDate(date2));

export const formatDistanceFromNow = (dateStr: string): string =>
	formatDistance(parseISO(dateStr), new Date(), {
		addSuffix: true,
	})
		.replace("about ", "")
		.replace(/^in\b/, "In");

interface GetTodayOptions {
	end?: boolean;
}

// Supabase needs an ISO date string. However, that string will be different on every render because the MS or SEC have changed, which isn't good. So we use this trick to remove any time
export const getToday = function (options: GetTodayOptions = {}): string {
const today = new Date();

// This is necessary to compare with created_at from Supabase, because it it not at 0.0.0.0, so we need to set the date to be END of the day when we compare it with earlier dates
if (options?.end)
// Set to the last second of the day
today.setUTCHours(23, 59, 59, 999);
else today.setUTCHours(0, 0, 0, 0);
return today.toISOString();
};

export const formatCurrency = (value: number): string =>
new Intl.NumberFormat("en", {
style: "currency",
currency: "USD",
}).format(value);
