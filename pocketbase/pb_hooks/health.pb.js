// This project-specific endpoint verifies that our hooks were loaded, not only
// that a generic PocketBase process is responding.
routerAdd("GET", "/api/debt-detox/health", (e) => {
	return e.json(200, {
		status: "ok",
		service: "debt-detox-pocketbase",
	})
})
