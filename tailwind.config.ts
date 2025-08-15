import type { Config } from "tailwindcss";


import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: false,
			padding: "0"
		},
		extend: {
			// ...existing theme config...
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
