/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs-extra");

const packagePath = "package.json";
const gradlePath = "./android/app/build.gradle";
const versionCodeRegex = /(versionCode )([0-9]+)/gm;

function replaceVersionCode(_, version, p1, __) {
  return [p1, version].join("");
}

/**
 * Prepare the package.json file for a new fix|release|breaking cycle.
 * In order to use the automatic functionality of standard-version, just remove the -rc.x suffix to initiate
 * a new cycle.
 */
const replaceCanaryVersion = () => {
  // read package.json as JSON
  const package = JSON.parse(fs.readFileSync(packagePath).toString("utf8"));

  const versionSplit = package.version.split("-");

  // replace the version, removing the rc part
  package.version = `${versionSplit[0]}-canary.${parseInt(
    process.argv[2],
    10
  )}`;

  const contents = fs.readFileSync(gradlePath).toString("utf8");

  const updatedGradleContents = contents.replace(
    versionCodeRegex,
    (substr, ...args) =>
      replaceVersionCode(
        substr,
        `20000${parseInt(process.argv[2], 10)}`,
        ...args
      )
  );
  fs.writeFileSync(packagePath, JSON.stringify(package, undefined, 2));
  fs.writeFileSync(gradlePath, updatedGradleContents);
};

replaceCanaryVersion();
