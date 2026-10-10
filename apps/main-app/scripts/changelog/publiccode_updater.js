/**
 * Synchronize the version and release date in publiccode.yml during app
 * versioning:
 *
 * - The line `softwareVersion: $VERSION` with the new generated version
 * - The line `releaseDate: '$DATE'` with the today date
 */

const softwareVersionRegex = /(softwareVersion: )(.+)/m;
const releaseDateRegex = /(releaseDate: ["'])(.+)(["'])/gm;

module.exports.readVersion = function (contents) {
  // return the 2nd group of the regex (the version)
  return softwareVersionRegex.exec(contents)[2];
};

function replaceReleaseDate(_, version, prefix, suffix) {
  return [prefix, version, suffix].join("");
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
