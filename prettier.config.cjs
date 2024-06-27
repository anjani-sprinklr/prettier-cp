module.exports = {
  printWidth: 120,
  tabWidth: 2,
  plugins: ["prettier-cp/lib/src/index.js"],
  importOrder: [
    "lib",
    "components",
    "hooks",
    "types",
    "utils|helpers",
    "constants",
  ],
  importOrderSeparation: true,
};
