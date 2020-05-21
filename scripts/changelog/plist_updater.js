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
  //TODO: rc
  infoObj.CFBundleShortVersionString = version;
  infoObj.CFBundleVersion = parseInt(infoObj.CFBundleVersion, 10) + 1;
  return plist.build(infoObj);
};
