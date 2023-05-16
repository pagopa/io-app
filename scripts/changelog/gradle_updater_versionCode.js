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

const versionCodeRegex = /(versionCode ")(.+)(")/gm;

module.exports.readVersion = function (contents) {
  // return the 2nd group of the regex (the version)
  return versionCodeRegex.exec(contents)[2];
};

function replaceVersionCode(match, version, p1, p2, p3) {
  return [p1, version, p3].join("");
}

module.exports.writeVersion = function (contents, version) {
  // replace the old version (match #2 group) of regex, with the new version
  version = parseInt(version, 10) + 1;

  contents = contents.replace(versionCodeRegex, (substr, ...args) =>
    replaceVersionCode(substr, version, ...args)
  );

  return contents;
};
