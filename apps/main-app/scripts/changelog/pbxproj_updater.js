/**
 * This is an updater for the utility "commit-and-tag-version" that increase the
 * CURRENT_PROJECT_VERSION value for pbxproj files. The value will follow the
 * same rules applyied for CFBundleVersion in "plist_updater"
 */

const versionModule = require("./version_utility.js");

module.exports.readVersion = function (contents) {
  return "-";
};

/**
 * @param match
 * @param version
 * @param p1: The key CURRENT_PROJECT_VERSION
 * @param p2: The value
 * @param p3: The ";"
 * @returns {string}
 */
function replacer(match, version, p1, p2, p3) {
  const currentProjectVersionValue = versionModule.iosGetBuildVersion(
    version,
    p2
  );
  return [p1, currentProjectVersionValue, p3].join("");
}

function synchronizeShareExtensionBuildVersions(contents) {
  const sectionStart = contents.indexOf(
    "/* Begin XCBuildConfiguration section */"
  );
  const sectionEnd = contents.indexOf("/* End XCBuildConfiguration section */");
  if (sectionStart === -1 || sectionEnd === -1) {
    throw new Error("Missing Xcode build configuration section");
  }

  const section = contents.slice(sectionStart, sectionEnd);
  const configPattern =
    /^\t\t([A-F0-9]+) \/\* [^*]+ \*\/ = \{\n([\s\S]*?)^\t\t\};/gm;
  const configs = [...section.matchAll(configPattern)].map(match => {
    const body = match[0];
    const name = body.match(/^\t\t\tname = "?([^";]+)"?;/m)?.[1];
    const bundleId = body.match(
      /PRODUCT_BUNDLE_IDENTIFIER\s*=\s*"?([^";]+)"?;/
    )?.[1];
    return { body, name, bundleId };
  });
  const hostBuildVersions = new Map(
    configs
      .filter(config => config.body.includes("INFOPLIST_FILE = IO/Info.plist;"))
      .map(config => {
        const buildVersion = config.body.match(
          /CURRENT_PROJECT_VERSION\s*=\s*(\d+);/
        )?.[1];
        if (!config.name || !buildVersion) {
          throw new Error("Missing host app build version");
        }
        return [config.name, buildVersion];
      })
  );

  let extensionConfigCount = 0;
  const updatedSection = section.replace(configPattern, body => {
    const config = configs.find(candidate => candidate.body === body);
    if (!config?.bundleId?.endsWith(".ShareExtension")) {
      return body;
    }
    extensionConfigCount += 1;
    const hostBuildVersion = config.name
      ? hostBuildVersions.get(config.name)
      : undefined;
    if (!hostBuildVersion) {
      throw new Error(
        `Missing host app build version for ${config.name ?? "unknown"}`
      );
    }
    const buildVersionPattern = /(CURRENT_PROJECT_VERSION\s*=\s*)\d+(;)/;
    if (!buildVersionPattern.test(body)) {
      throw new Error(
        `Missing share extension build version for ${config.name ?? "unknown"}`
      );
    }
    return body.replace(
      buildVersionPattern,
      (_match, prefix, suffix) => `${prefix}${hostBuildVersion}${suffix}`
    );
  });
  if (extensionConfigCount === 0) {
    throw new Error("Missing share extension build configurations");
  }
  return (
    contents.slice(0, sectionStart) +
    updatedSection +
    contents.slice(sectionEnd)
  );
}

module.exports.writeVersion = function (contents, version) {
  const regex = /(CURRENT_PROJECT_VERSION\s?=\s?)(\d+)(;)/gm;

  contents = contents.replace(regex, (substr, ...args) =>
    replacer(substr, version, ...args)
  );
  contents = contents.replace(
    /(MARKETING_VERSION\s?=\s?)[\d.]+(;)/gm,
    `$1${versionModule.getVersion(version)}$2`
  );
  return synchronizeShareExtensionBuildVersions(contents);
};
