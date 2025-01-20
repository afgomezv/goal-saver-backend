/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // transform: {
  //   "^.+.tsx?$": ["ts-jest", {}],
  // },
  preset: "ts-jest",
  testEnvironment: "node",
  detectOpenHandles: true,
  // openHandlesTimeout: 10 * 1000,
  // testTimeout: 10 * 1000,
};
