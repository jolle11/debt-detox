import {
	defineRailway,
	github,
	preserve,
	project,
	service,
	volume,
} from "railway/iac";

const REPO = "jolle11/debt-detox";

export default defineRailway(() => {
	const web = service("debt-detox", {
		source: github(REPO, { branch: "main" }),
		build: {
			builder: "RAILPACK",
			buildCommand:
				"pnpm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/",
			watchPatterns: [
				"/app/**",
				"/components/**",
				"/contexts/**",
				"/data/**",
				"/hooks/**",
				"/i18n/**",
				"/lib/**",
				"/messages/**",
				"/public/**",
				"/utils/**",
				"/proxy.ts",
				"/next.config.ts",
				"/package.json",
				"/pnpm-lock.yaml",
				"/tsconfig.json",
				"/postcss.config.*",
				"/.dockerignore",
			],
		},
		deploy: {
			startCommand: "HOSTNAME=0.0.0.0 node .next/standalone/server.js",
		},
		variables: {
			NEXT_PUBLIC_POCKETBASE_URL: preserve(),
			NEXT_PUBLIC_SITE_URL: preserve(),
		},
	});

	const pocketbaseVolume = volume("pocketbase-volume", {
		region: "europe-west4-drams3a",
		sizeMB: 5000,
	});

	const pocketbase = service("pocketbase", {
		source: github(REPO, { branch: "main", rootDirectory: "/pocketbase" }),
		build: {
			builder: "DOCKERFILE",
			dockerfilePath: "Dockerfile",
			watchPatterns: ["/pocketbase/**", "!/pocketbase/**/*.md"],
		},
		deploy: {
			healthcheckPath: "/api/debt-detox/health",
			healthcheckTimeout: 30,
		},
		variables: {
			PB_ALLOWED_ORIGINS: preserve(),
			PORT: preserve(),
		},
		volumeMounts: { "/pb/pb_data": pocketbaseVolume },
	});

	return project("debt-detox", {
		resources: [web, pocketbase, pocketbaseVolume],
	});
});
