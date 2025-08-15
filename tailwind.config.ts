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
			center: true,
			padding: {
				DEFAULT: "1rem",
				sm: "1.5rem",
				lg: "2rem",
				xl: "2.5rem",
				'2xl': "3rem",
			},
		},
		extend: {
			// ...existing theme config...
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
