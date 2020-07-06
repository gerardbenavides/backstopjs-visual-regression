/* 
  backstop reference --configPath=backstop-settings.js --pathFile=paths --env=staging --refHost=https://staging.a4.angebot.se/
  backstop test --configPath=backstop-settings.js --pathFile=paths --env=staging --testHost=https://staging.a4.angebot.se/
  backstop reference --configPath=backstop-settings.js --pathFile=paths --env=prod --refHost=https://izonen.usefulsolutions.se/
  backstop test --configPath=backstop-settings.js --pathFile=paths --env=prod --testHost=https://izonen.usefulsolutions.se/
*/

var args = require('minimist')(process.argv.slice(2)); // grabs the process arguments
var defaultPaths = ['/']; // default path just checks the homepage as a quick smoke test
var scenarios = []; // The array that'll have the URL paths to check

// env argument will capture the environment URL
// if you use one of the options below to pass in, e.g. --env=dev
var environments = {
  'dev': 'http://example.com',
  'staging': 'https://staging.a4.angebot.se/',
  'prod': 'https://izonen.usefulsolutions.se/'
};
var default_environment = 'prod';

// Environments that are being compared
if (!args.env) {
  args.env = default_environment;
}
// if you pass in a bogus environment, it’ll still use the default environment
else if (!environments.hasOwnProperty(args.env)) {
  args.env = default_environment;
}

// Site for reference screenshots
if (!args.refHost) {
  args.refHost = environments[args.env];
}

// Site for test screenshots
if (!args.testHost) {
  args.testHost = environments[args.env];
}

// Directories to save screenshots
var saveDirectories = {
  "bitmaps_reference": "./backstop_data/"+args.env+"_reference",
  "bitmaps_test": "./backstop_data/"+args.env+"_test",
  "html_report": "./backstop_data/"+args.env+"_html_report",
  "ci_report": "./backstop_data/"+args.env+"_ci_report"
};

// Work out which paths to use: an array from a file, a supplied array, or defaults
// We'll be using the array from paths.js
if (args.pathFile) {
  var pathConfig = require('./'+args.pathFile+'.js'); // use paths.js file
  var paths = pathConfig.array;
} else if (args.paths) {
  pathString = args.paths; // pass in a comma-separated list of paths in terminal
  var paths = pathString.split(',');
} else {
  var paths = defaultPaths; // keep with the default of just the homepage
}

// Scenarios are a default part of config for BackstopJS
// Explanations for the sections below are at https://www.npmjs.com/package/backstopjs
for (var k = 0; k < paths.length; k++) {
  scenarios.push (
    {
      "label": paths[k],
      "referenceUrl": args.refHost+paths[k],
      "url": args.testHost+paths[k],
      "hideSelectors": [],
      "removeSelectors": [],
      "selectors": ["document"], // "document" will snapshot the entire page
      "delay": 1000,
      "misMatchThreshold" : 0.1
    }
  );
}

// BackstopJS configuration
module.exports =
{
  "id": "Angebot_"+args.env+"_config",
  "viewports": [
    {
      "name": "1366x768",
      "width": 1366,
      "height": 768
    },
  ],
  "scenarios":
    scenarios,
  "paths":
    saveDirectories,
  "casperFlags": ["--ignore-ssl-errors=true", "--ssl-protocol=any"],
  "engine": "puppet", // alternate can be slimerjs
  "report": ["browser"],
  "debug": false
};