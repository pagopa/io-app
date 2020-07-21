const regexVersion = /([0-9.]+)(-rc.(\d+))?/gm;

/**
 * Return the version (without the rc).
 * eg: "1.4.0-rc.0" will return => "1.4.0"
 * @param rawVersion
 * @return {string}
 */
export const getVersion = rawVersion => {
  return rawVersion.replace(regexVersion, "$1");
};

/**
 * Return the rc number.
 * eg: "1.4.0-rc.0" will return => "0"
 * @param rawVersion
 * @return {string}
 */
export const getRC = rawVersion => {
  return rawVersion.replace(regexVersion, "$3");
};

/**
 * Return true if the version is rc.
 * eg: "1.4.0-rc.0" will return true
 * "1.4.0" will return false
 *
 * @param rawVersion
 * @return {boolean}
 */
export const isRc = rawVersion => {
  return rawVersion.replace(regexVersion, "$3") !== "";
};

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
const iosGetBuildVersion = (rawVersion, currentBuildVersion) => {
  return isRc(rawVersion)
    ? getRC(rawVersion)
    : parseInt(currentBuildVersion, 10) + 1;
};
