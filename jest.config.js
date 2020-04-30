module.exports = {
  "transform": {
    ".jsx": "babel-jest",
    ".js": "babel-jest"
  },
  "setupFilesAfterEnv": [
    "./test-setup.js"
  ],
  "verbose": true,
}
