import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	server: {
		port: 3000,
		open: false,
		proxy: {
			"/api": {
				target: "http://localhost:5000",
				changeOrigin: true,
			},
			"/health": {
				target: "http://localhost:5000",
				changeOrigin: true,
			},
			"/docs": {
				target: "http://localhost:5000",
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "dist",
	},
});
