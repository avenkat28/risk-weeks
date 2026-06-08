import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172019",
        moss: "#2F6F4E",
        mint: "#DFF5E8",
        lemon: "#F7D56B",
        coral: "#EC7063",
        poppy: "#C64737",
        paper: "#FBFAF5",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 25, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
