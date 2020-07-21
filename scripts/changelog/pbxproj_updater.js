/**
 * This is an updater for the utility "standard-version" that increase the CURRENT_PROJECT_VERSION value
 * for pbxproj files. The value will follow the same rules applyied for CFBundleVersion in "plist_updater"
 */

import { iosGetBuildVersion } from "./version_regex";

module.exports.readVersion = function(contents) {
  return "-";
};

/***
 *
 * @param match
 * @param version
 * @param p1: the key CURRENT_PROJECT_VERSION
 * @param p2: the value
 * @param p3: the ";"
 * @return {string}
 */
function replacer(match, version, p1, p2, p3) {
  const currentProjectVersionValue = iosGetBuildVersion(version, p2);
  return [p1, currentProjectVersionValue, p3].join("");
}

module.exports.writeVersion = function(contents, version) {
  const regex = /(CURRENT_PROJECT_VERSION\s?=\s?)(\d+)(;)/gm;

  contents = contents.replace(regex, (substr, ...args) =>
    replacer(substr, version, ...args)
  );
  return contents;
};
