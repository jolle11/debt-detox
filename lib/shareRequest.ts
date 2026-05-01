export function getShareRequestOptions(token: string) {
	return {
		headers: {
			"x-share-token": token,
		},
	};
}
