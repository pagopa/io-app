const fs = require("fs-extra");
const versionModule = require("./version_utility.js");

const packagePath = "package.json";

/***
 * Prepare the package.json file for a new fix|release|breaking cycle.
 * In order to use the automatic functionality of standard-version, just remove the -rc.x suffix to initiate
 * a new cycle.
 */
const prepareToNewCycle = () => {
  // read package.json as JSON
  const package = JSON.parse(fs.readFileSync(packagePath).toString("utf8"));
  // replace the version, removing the rc part
  package.version = versionModule.getVersion(package.version);
  console.log(package.version);
  fs.writeFileSync(packagePath, package);
};

prepareToNewCycle();
