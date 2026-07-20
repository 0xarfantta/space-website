/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      colors: {
        orbit: {
          deep: "#0a0618",
          accent: "#a5b4fc",
          accentHover: "#c7d2fe",
          muted: "rgba(226, 232, 240, 0.78)",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.12)",
        "glass-dark": "0 8px 32px rgba(15, 23, 42, 0.28)",
        accent: "0 10px 28px rgba(99, 102, 241, 0.35)",
      },
      backgroundImage: {
        "space-photo": "url('/images/space-bg.jpg')",
        "accent-gradient":
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #a78bfa 100%)",
        "title-gradient":
          "linear-gradient(120deg, #ffffff 0%, #c7d2fe 40%, #a5b4fc 70%, #e9d5ff 100%)",
        "title-gradient-light":
          "linear-gradient(120deg, #0f172a 0%, #3730a3 40%, #4f46e5 70%, #7c3aed 100%)",
      },
      screens: {
        xs: "400px",
      },
      animation: {
        kenburns: "kenburns 40s ease-in-out infinite alternate",
        "fade-up": "fadeUp 0.8s ease both",
        float: "float 18s ease-in-out infinite alternate",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.12) translate(-2%, 1.5%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "0.3" },
          "100%": {
            transform: "translate(8%, -10%) scale(1.15)",
            opacity: "0.5",
          },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
