/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs-extra");

const packagePath = "package.json";
const appJsonPath = "app.json";

/**
 * Prepare the package.json file for a new fix|release|breaking cycle. In order
 * to use the automatic functionality of commit-and-tag-version, just remove the
 * -rc.x suffix to initiate a new cycle. The Android versionCode in app.json is
 * set to the given build code.
 */
const replaceCanaryVersion = () => {
  // read package.json as JSON
  const package = JSON.parse(fs.readFileSync(packagePath).toString("utf8"));

  const versionSplit = package.version.split("-");

  const normalizedVersion = parseInt(process.argv[2].slice(5), 10);

  // replace the version, removing the rc part
  package.version = `${versionSplit[0]}-canary.${isNaN(normalizedVersion) ? 0 : normalizedVersion}`;

  const appJson = JSON.parse(fs.readFileSync(appJsonPath).toString("utf8"));
  appJson.android.versionCode = parseInt(process.argv[2], 10);

  fs.writeFileSync(packagePath, JSON.stringify(package, undefined, 2));
  fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, undefined, 2)}\n`);
};

replaceCanaryVersion();
