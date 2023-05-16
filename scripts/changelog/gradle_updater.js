/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable functional/immutable-data */
/**
 * This is an updater for the utility "standard-version" that increase the versionName value
 * for gradle files.
 * Replace the line
 *
 * versionName "$VERSION"
 *
 * with the new generated version.
 *
 */

const versionModule = require("./version_utility.js");

const versionNameRegex = /(versionName ")(.+)(")/gm;
const versionCodeRegex = /(versionCode )([0-9]+)/gm;

module.exports.readVersion = function (contents) {
  // return the 2nd group of the regex (the version)
  return versionNameRegex.exec(contents)[2];
};

function replaceVersionName(match, version, p1, p2, p3) {
  return [p1, version, p3].join("");
}

function getVersionCode(contents) {
  return versionCodeRegex.exec(contents)[2];
}

module.exports.writeVersion = function (contents, version) {
  // replace the old version (match #2 group) of regex, with the new version

  const versionCodeNumber = getVersionCode(contents);

  const versionClean = versionModule.getVersion(version);
  const buildNumber = versionModule.androidGetBuildVersion(version);
  version =
    buildNumber !== undefined ? `${versionClean}.${buildNumber}` : version;

  contents = contents.replace(versionNameRegex, (substr, ...args) =>
    replaceVersionName(substr, version, ...args)
  );

  contents = contents.replace(versionCodeRegex, (substr, ...args) =>
    replaceVersionName(substr, parseInt(versionCodeNumber, 10) + 1, ...args)
  );

  return contents;
};
