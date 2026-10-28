import type { Metadata } from "next";
import SharedDebtExpired from "@/components/share/SharedDebtExpired";
import SharedDebtView from "@/components/share/SharedDebtView";
import SharedLinkUnavailable from "@/components/share/SharedLinkUnavailable";
import { SITE_NAME } from "@/lib/seo";
import { getSharedDebt } from "@/lib/shareData";

export const dynamic = "force-dynamic";

interface SharePageProps {
	params: Promise<{ token: string }>;
}

export async function generateMetadata({
	params,
}: SharePageProps): Promise<Metadata> {
	const { token } = await params;
	const result = await getSharedDebt(token);
	if (result.status !== "ok") return {};

	const title = `${result.data.debt.name} | ${SITE_NAME}`;
	return { title, openGraph: { title, siteName: SITE_NAME } };
}

export default async function SharePage({ params }: SharePageProps) {
	const { token } = await params;
	const result = await getSharedDebt(token);

	if (result.status === "unavailable") return <SharedLinkUnavailable />;
	if (result.status === "expired") return <SharedDebtExpired />;

	const { debt, payments, share, currency } = result.data;
	return (
		<SharedDebtView
			debt={debt}
			payments={payments}
			share={share}
			currency={currency}
		/>
	);
}
