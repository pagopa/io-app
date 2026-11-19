/**
 * Writes a release version into app.json, the source of the native versions
 * applied by `expo prebuild`:
 *
 * - `version` (CFBundleShortVersionString): the version without the prerelease
 *   suffix, e.g. `1.4.0-rc.1` -> `1.4.0`
 * - `ios.buildNumber` (CFBundleVersion): same rules as before, see
 *   `version_utility.iosGetBuildVersion`
 * - `android.version` (versionName): the prerelease number appended to the
 *   version, e.g. `1.4.0-rc.1` -> `1.4.0.1`
 * - `android.versionCode`: the previous value increased by one
 */

const versionModule = require("./version_utility.js");

module.exports.writeVersion = function (contents, version) {
  const appJson = JSON.parse(contents);
  const versionClean = versionModule.getVersion(version);
  const androidBuildNumber = versionModule.androidGetBuildVersion(version);

  const updatedAppJson = {
    ...appJson,
    version: versionClean,
    ios: {
      ...appJson.ios,
      buildNumber: versionModule
        .iosGetBuildVersion(version, appJson.ios.buildNumber)
        .toString()
    },
    android: {
      ...appJson.android,
      version:
        androidBuildNumber !== undefined
          ? `${versionClean}.${androidBuildNumber}`
          : version,
      versionCode: appJson.android.versionCode + 1
    }
  };

  return `${JSON.stringify(updatedAppJson, undefined, 2)}\n`;
};
