const CACHE_NAME = "debt-detox-v1";
const APP_SHELL = [
	"/",
	"/manifest.webmanifest",
	"/pwa-192x192.png",
	"/pwa-512x512.png",
	"/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME)
					.map((key) => caches.delete(key)),
			),
		),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;

	if (request.method !== "GET") {
		return;
	}

	const url = new URL(request.url);

	if (url.origin !== self.location.origin) {
		return;
	}

	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					const copy = response.clone();
					void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
					return response;
				})
				.catch(async () => {
					const cached = await caches.match(request);
					return cached || caches.match("/");
				}),
		);
		return;
	}

	if (
		url.pathname.startsWith("/_next/static/") ||
		url.pathname.endsWith(".png") ||
		url.pathname.endsWith(".svg") ||
		url.pathname.endsWith(".ico") ||
		url.pathname.endsWith(".webmanifest")
	) {
		event.respondWith(
			caches.match(request).then(async (cached) => {
				if (cached) {
					return cached;
				}

				const response = await fetch(request);
				const copy = response.clone();
				void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
				return response;
			}),
		);
	}
});
