/**
 * This is an updater for the utility "standard-version" that allows to update the values
 * CFBundleShortVersionString and CFBundleVersion.
 *
 * eg.
 * 1.4.0-rc.0 -> CFBundleShortVersionString = 1.4.0 CFBundleVersion = 0
 * 1.4.0-rc.1 -> CFBundleShortVersionString = 1.4.0 CFBundleVersion = 1
 * 1.4.0 -> CFBundleShortVersionString = 1.4.0 CFBundleVersion = 2
 * 1.4.1-rc.0 -> CFBundleShortVersionString = 1.4.1 CFBundleVersion = 0
 * 1.4.1 -> CFBundleShortVersionString = 1.4.1 CFBundleVersion = 1
 * 1.4.2 -> CFBundleShortVersionString = 1.4.2 CFBundleVersion = 0
 *
 * For iOS apps, build numbers (CFBundleVersion) must be unique within each release train,
 * but they do not need to be unique across different release trains.
 *
 */

import {
  getRC,
  getVersion,
  iosGetBuildVersion,
  isRc,
  regexVersion
} from "./version_regex";

const plist = require("plist");

module.exports.readVersion = function(contents) {
  const infoObj = plist.parse(contents);

  if (!"CFBundleShortVersionString" in infoObj) {
    console.log(
      "Field CFBundleShortVersionString not defined; can't read the current plist version"
    );
    throw "CFBundleShortVersionString not found";
  }
  return infoObj.CFBundleShortVersionString;
};

module.exports.writeVersion = function(contents, version) {
  const infoObj = plist.parse(contents);
  if (!"CFBundleShortVersionString" in infoObj) {
    console.log(
      "Field CFBundleShortVersionString not defined; can't read the current plist version"
    );
    throw "CFBundleShortVersionString not found";
  }
  // For ios, if the new version is RC, keep the same version.
  // eg: current version 1.2.3, new version 1.3.0-rc.0, write in plist file: 1.3.0, when a new version
  // 1.3.0-rc.1 is released, write: 1.3.0
  infoObj.CFBundleShortVersionString = getVersion(version);

  // if the new version is a rc, use the rc number as CFBundleVersion
  // Else if the new version is the final version, just increase by one the CFBundleVersion
  infoObj.CFBundleVersion = iosGetBuildVersion(
    version,
    infoObj.CFBundleVersion
  );
  return plist.build(infoObj);
};
