import fs from "node:fs";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3000,
		open: false,
	},
	build: {
		outDir: "dist",
	},
	plugins: [
		{
			name: "copy-assets",
			closeBundle() {
				if (fs.existsSync("assets")) {
					fs.cpSync("assets", "dist/assets", { recursive: true });
				}
			},
		},
	],
});
