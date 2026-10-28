import type { Metadata } from "next";
import SharedDebtExpired from "@/components/share/SharedDebtExpired";
import SharedLinkUnavailable from "@/components/share/SharedLinkUnavailable";
import SharedProfileView from "@/components/share/SharedProfileView";
import { SITE_NAME } from "@/lib/seo";
import { getSharedProfile } from "@/lib/shareData";

export const dynamic = "force-dynamic";

interface ShareProfilePageProps {
	params: Promise<{ token: string }>;
}

export async function generateMetadata({
	params,
}: ShareProfilePageProps): Promise<Metadata> {
	const { token } = await params;
	const result = await getSharedProfile(token);
	if (result.status !== "ok" || !result.data.userName) return {};

	const title = `${result.data.userName} | ${SITE_NAME}`;
	return { title, openGraph: { title, siteName: SITE_NAME } };
}

export default async function ShareProfilePage({
	params,
}: ShareProfilePageProps) {
	const { token } = await params;
	const result = await getSharedProfile(token);

	if (result.status === "unavailable") return <SharedLinkUnavailable />;
	if (result.status === "expired") return <SharedDebtExpired />;

	const { debts, share, currency, userName } = result.data;
	return (
		<SharedProfileView
			debts={debts}
			share={share}
			currency={currency}
			userName={userName}
		/>
	);
}
