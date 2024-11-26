/* eslint-disable functional/immutable-data */
const regexVersion = /([0-9.]+)(-rc.(\d+))?/gm;
const regexCanaryVersion = /([0-9.]+)(-canary.(\d+))?/gm;
/**
 * Return the version (without the rc).
 * eg: "1.4.0-rc.0" will return => "1.4.0"
 * @param rawVersion
 * @return {string}
 */
module.exports.getVersion = function (rawVersion) {
  if (rawVersion.indexOf("canary") !== -1) {
    return rawVersion.replace(regexCanaryVersion, "$1");
  }
  return rawVersion.replace(regexVersion, "$1");
};

/**
 * Return the rc number.
 * eg: "1.4.0-rc.0" will return => "0"
 * @param rawVersion
 * @return {string}
 */
function getRC(rawVersion) {
  if (rawVersion.indexOf("canary") !== -1) {
    return rawVersion.replace(regexCanaryVersion, "$3");
  }
  return rawVersion.replace(regexVersion, "$3");
}

/**
 * Return true if the version is rc.
 * eg: "1.4.0-rc.0" will return true
 * "1.4.0" will return false
 *
 * @param rawVersion
 * @return {boolean}
 */
function isRc(rawVersion) {
  if (rawVersion.indexOf("canary") !== -1) {
    return rawVersion.replace(regexCanaryVersion, "$3") !== "";
  }
  return rawVersion.replace(regexVersion, "$3") !== "";
}

/**
 * Return the build number for ios. If the new version is RC, return the rc number,
 * else increase the previously used build number by one.
 *
 * eg: rawVersion: "1.4.0-rc.0" currentBuildVersion: "5" will return "0"
 * rawVersion: "1.4.0" currentBuildVersion: "5" will return "6"
 * @param rawVersion
 * @param currentBuildVersion
 * @return {*}
 */
module.exports.iosGetBuildVersion = function (rawVersion, currentBuildVersion) {
  return isRc(rawVersion)
    ? getRC(rawVersion)
    : parseInt(currentBuildVersion, 10) + 1;
};

module.exports.androidGetBuildVersion = function (rawVersion) {
  return isRc(rawVersion) ? getRC(rawVersion) : undefined;
};
