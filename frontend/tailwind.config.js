/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],   // replaces default sans
        heading: ['Poppins', 'sans-serif'], // example custom heading font
      },
    },
  },
  plugins: [],
  safelist: [
    "from-emerald-500","to-green-600","bg-emerald-50","text-emerald-700",
    "from-blue-500","to-indigo-600","bg-blue-50","text-blue-700",
    "from-purple-500","to-violet-600","bg-purple-50","text-purple-700",
    "from-yellow-500","to-orange-500","bg-yellow-50","text-yellow-700",
    "from-red-400","to-pink-500","bg-red-50","text-red-700",
    { pattern: /(from|to)-(emerald|green|blue|indigo|purple|violet|yellow|orange|red|pink)-(50|400|500|600|700)/ },
    { pattern: /(bg|text)-(emerald|green|blue|indigo|purple|violet|yellow|orange|red|pink)-(50|400|500|600|700)/ },
    { pattern: /bg-gradient-to-(r|l|t|b|tr|tl|br|bl)/ },
  ],
};
