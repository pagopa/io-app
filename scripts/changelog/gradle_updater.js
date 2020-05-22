/**
 * This is an updater for the utility "standard-version" that increase the versionName value
 * for gradle files.
 */

const versionNameRegex = /(versionName ")(.+)(")/gm;
const versionCodeRegex = /(versionCode )(\d+)/m;

module.exports.readVersion = function(contents) {
  // return the 2nd group of the regex (the version)
  return versionNameRegex.exec(contents)[2];
};

function replaceVersionName(match, version, p1, p2, p3, _, _) {
  return [p1, version, p3].join("");
}

function increaseVersionCode(match, p1, p2, _, _) {
  return [p1, parseInt(p2, 10) + 1].join("");
}

module.exports.writeVersion = function(contents, version) {
  // replace the old version (match #2 group) of regex, with the new version
  contents = contents.replace(versionNameRegex, (substr, ...args) =>
    replaceVersionName(substr, version, ...args)
  );

  contents = contents.replace(versionCodeRegex, increaseVersionCode);

  return contents;
};
