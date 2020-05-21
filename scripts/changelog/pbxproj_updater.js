module.exports.readVersion = function(contents) {
  return "-";
};

/***
 *
 * @param match
 * @param p1: the key CURRENT_PROJECT_VERSION
 * @param p2: the value
 * @param p3: the ";"
 * @param offset
 * @param string
 * @return {string}
 */
function replacer(match, p1, p2, p3, offset, string) {
  const currentProjectVersionValue = parseInt(p2, 10) + 1;
  return [p1, currentProjectVersionValue, p3].join("");
}

module.exports.writeVersion = function(contents, version) {
  const regex = /(CURRENT_PROJECT_VERSION\s?=\s?)(\d+)(;)/gm;
  contents = contents.replace(regex, replacer);
  return contents;
};
