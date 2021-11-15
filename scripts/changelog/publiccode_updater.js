/**
 * This is an updater for the utility "standard-version" that increase the versionName value
 * for publiccode.yml file.
 * Replace the line:
 * softwareVersion: $VERSION
 * with the new generated version.
 *
 * and the line:
 * releaseDate: '$DATE'
 * with the today date.
 *
 */

const softwareVersionRegex = /(softwareVersion: )(.+)/gm;
const releaseDateRegex = /(releaseDate: ')(.+)(')/gm;

module.exports.readVersion = function (contents) {
  // return the 2nd group of the regex (the version)
  return softwareVersionRegex.exec(contents)[2];
};

function replaceReleaseDate(_, version, p1, p2, p3) {
  return [p1, version, p3].join("");
}

function replaceVersionName(_, version, p1) {
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
