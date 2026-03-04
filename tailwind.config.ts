import type { Config } from "tailwindcss";

// Keep landscape phones in mobile mode by requiring either a fine pointer
// (desktop/laptop) or a minimum height for coarse touch devices.
const config: Config = {
  theme: {
    screens: {
      sm: "640px",
      md: {
        raw: "(min-width: 768px) and (pointer: fine), (min-width: 768px) and (min-height: 600px)",
      },
      lg: {
        raw: "(min-width: 1024px) and (pointer: fine), (min-width: 1024px) and (min-height: 600px)",
      },
      xl: "1280px",
      "2xl": "1536px",
    },
  },
};

export default config;
