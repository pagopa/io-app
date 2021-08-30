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

const softwareVersionRegex = /(softwareVersion: )(.+)/gm;
const releaseDateRegex = /(releaseDate: ')(.+)(')/gm;

module.exports.readVersion = function (contents) {
  // return the 2nd group of the regex (the version)
  return softwareVersionRegex.exec(contents)[2];
};

function replaceReleaseDate(match, version, p1, p2, p3) {
  return [p1, version, p3].join("");
}

function replaceVersionName(match, version, p1) {
  return [p1, version].join("");
}

module.exports.writeVersion = function (contents, version) {
  // Update version
  contents = contents.replace(softwareVersionRegex, (substr, ...args) =>
    replaceVersionName(substr, version, ...args)
  );
  const today = new Date().toISOString().split("T")[0];

  // update date
  contents = contents.replace(releaseDateRegex, (substr, ...args) =>
    replaceReleaseDate(substr, today, ...args)
  );

  return contents;
};
