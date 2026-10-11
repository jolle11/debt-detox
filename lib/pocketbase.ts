import PocketBase from "pocketbase";
import { getTodayDateOnly } from "@/lib/dateOnly";

const pb = new PocketBase(
	process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090",
);

pb.autoCancellation(false);

// Lets the API resolve "today" in the user's timezone instead of UTC.
pb.beforeSend = (url, options) => {
	options.headers = {
		...options.headers,
		"X-Client-Date": getTodayDateOnly(),
	};
	return { url, options };
};

export default pb;
