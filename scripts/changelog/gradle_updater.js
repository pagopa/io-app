/**
 * This is an updater for the utility "standard-version" that increase the versionName value
 * for gradle files.
 */

const versionNameRegex = /(versionName ")(.+)(")/gm;

module.exports.readVersion = function(contents) {
  // return the 2nd group of the regex (the version)
  return versionNameRegex.exec(contents)[2];
};

function replaceVersion(match, version, p1, p2, p3, offset, string) {
  return [p1, version, p3].join("");
}

module.exports.writeVersion = function(contents, version) {
  // replace the old version (match #2 group) of regex, with the new version
  contents = contents.replace(versionNameRegex, (substr, ...args) =>
    replaceVersion(substr, version, ...args)
  );
  return contents;
};
