/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs-extra");

const version = "0.1.0-rc.0";

const packagePath = "package.json";

/**
 * Prepare the package.json file for a new fix|release|breaking cycle.
 * In order to use the automatic functionality of standard-version, just remove the -rc.x suffix to initiate
 * a new cycle.
 */
const replaceCanaryVersion = () => {
  // read package.json as JSON
  const package = JSON.parse(fs.readFileSync(packagePath).toString("utf8"));
  // replace the version, removing the rc part
  package.version = process.argv[2];
  fs.writeFileSync(packagePath, JSON.stringify(package, undefined, 2));
};

replaceCanaryVersion();
