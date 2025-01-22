/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // transform: {
  //   "^.+.tsx?$": ["ts-jest", {}],
  // },
  preset: "ts-jest",
  testEnvironment: "node",
  detectOpenHandles: true,
  openHandlesTimeout: 20 * 1000,
  testTimeout: 20 * 1000,
};
