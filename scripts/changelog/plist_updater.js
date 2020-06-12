/**
 * This is an updater for the utility "standard-version" that increase the CFBundleShortVersionString value without
 * the rc postfix.
 * The CFBundleVersion is always increased by one.
 */

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
  const regex = /([0-9.]+)(-rc.\d+)?/gm;
  // For ios, if a new rc version is release, keep the same version.
  // eg: current version 1.2.3, new version 1.3.0-rc.0, write in plist file: 1.3.0, when a new version
  // 1.3.0-rc.1 is released, write: 1.3.0
  infoObj.CFBundleShortVersionString = version.replace(regex, "$1");
  infoObj.CFBundleVersion = parseInt(infoObj.CFBundleVersion, 10) + 1;
  return plist.build(infoObj);
};
