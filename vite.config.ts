import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.png", "robots.txt"], // Add additional assets to the precache
			manifest: {
				name: "1D Nest",
				short_name: "1DNest",
				description: "Linear (1D) nesting app",
				theme_color: "#ffffff",
				icons: [
					{
						src: "assets/logo.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "assets/logo.png",
						sizes: "512x512",
						type: "image/png",
					},
					// You might want to add more icons for different resolutions
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
