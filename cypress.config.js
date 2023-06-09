module.exports = {
  e2e: {
    "baseUrl": "http://localhost:3001",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalWebKitSupport: true,
    testIsolation: false
  },
  env: {
    'cypress-react-selector': {
      root: '#root',
    },
  },
};