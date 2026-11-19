const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject
} = require("@expo/config-plugins");
const plist = require("@expo/plist").default;
const fs = require("node:fs");
const path = require("node:path");
const withSharing = require("expo-sharing/app.plugin.js").default;

const extensionName = "expo-sharing-extension";
const parentBundleIdSetting = "IO_SHARE_APP_ID";
const singlePdfOrImageActivationRule =
  'extensionItems.@count == 1 AND SUBQUERY(extensionItems, $extensionItem, $extensionItem.attachments.@count == 1 AND SUBQUERY($extensionItem.attachments, $attachment, ANY $attachment.registeredTypeIdentifiers UTI-CONFORMS-TO "public.image" OR ANY $attachment.registeredTypeIdentifiers UTI-CONFORMS-TO "com.adobe.pdf").@count == 1).@count == 1';

const withSharePdf = config => {
  const bundleId = config.ios?.bundleIdentifier;
  if (!bundleId) {
    throw new Error("expo-share-pdf requires ios.bundleIdentifier");
  }

  config = withAndroidManifest(config, mod => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(
      mod.modResults
    );
    activity.$["android:launchMode"] = "singleTask";
    activity["intent-filter"] = activity["intent-filter"]?.filter(
      filter =>
        !(
          filter.$?.["expo-sharing-intent-filters"] === "true" &&
          filter.action?.some(
            action =>
              action.$?.["android:name"] ===
              "android.intent.action.SEND_MULTIPLE"
          )
        )
    );
    return mod;
  });
  config = withDangerousMod(config, [
    "ios",
    async mod => {
      const file = path.join(
        mod.modRequest.platformProjectRoot,
        extensionName,
        "Info.plist"
      );
      const info = plist.parse(fs.readFileSync(file, "utf8"));
      info.MainTargetUrlScheme = `$(${parentBundleIdSetting})`;
      info.CFBundleDisplayName = "IO";
      fs.writeFileSync(file, plist.build(info));
      const canaryFile = path.join(
        mod.modRequest.platformProjectRoot,
        "IO",
        "IO-Canary.entitlements"
      );
      let entitlements;
      try {
        entitlements = plist.parse(fs.readFileSync(canaryFile, "utf8"));
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
      if (entitlements) {
        const key = "com.apple.security.application-groups";
        const groups = entitlements[key] ?? [];
        const group = `group.$(${parentBundleIdSetting})`;
        if (!groups.includes(group)) {
          groups.push(group);
        }
        entitlements[key] = groups;
        fs.writeFileSync(canaryFile, plist.build(entitlements));
      }
      return mod;
    }
  ]);
  config = withInfoPlist(config, mod => {
    const urlTypes = mod.modResults.CFBundleURLTypes ?? [];
    if (
      !urlTypes.some(type =>
        type.CFBundleURLSchemes?.includes("$(PRODUCT_BUNDLE_IDENTIFIER)")
      )
    ) {
      urlTypes.push({
        CFBundleTypeRole: "Editor",
        CFBundleURLSchemes: ["$(PRODUCT_BUNDLE_IDENTIFIER)"]
      });
    }
    mod.modResults.CFBundleURLTypes = urlTypes;
    return mod;
  });
  config = withXcodeProject(config, mod => {
    const project = mod.modResults;
    const nativeTargets = project.pbxNativeTargetSection();
    const lists = project.pbxXCConfigurationList();
    const builds = project.pbxXCBuildConfigurationSection();
    const appTarget = project.getFirstTarget().firstTarget;
    const appConfigurations = lists[appTarget.buildConfigurationList];
    const appInfo = plist.parse(
      fs.readFileSync(
        path.join(mod.modRequest.platformProjectRoot, "IO", "Info.plist"),
        "utf8"
      )
    );
    const appBuildSettingsByConfiguration = new Map(
      appConfigurations.buildConfigurations.map(entry => [
        builds[entry.value]?.name?.replaceAll('"', ""),
        builds[entry.value]?.buildSettings
      ])
    );
    const hasCanary = appConfigurations.buildConfigurations.some(
      entry => builds[entry.value]?.name?.replaceAll('"', "") === "Canary"
    );
    for (const target of Object.values(nativeTargets)) {
      if (!target || typeof target !== "object") {
        continue;
      }
      const name = target.name?.replaceAll('"', "");
      if (name !== "IO" && name !== extensionName) {
        continue;
      }
      const list = lists[target.buildConfigurationList];
      if (!list) {
        throw new Error(`Missing Xcode configuration list for ${name}`);
      }
      if (
        name === extensionName &&
        hasCanary &&
        !list.buildConfigurations.some(
          entry => builds[entry.value]?.name?.replaceAll('"', "") === "Canary"
        )
      ) {
        const release = list.buildConfigurations.find(
          entry => builds[entry.value]?.name?.replaceAll('"', "") === "Release"
        );
        if (!release) {
          throw new Error(
            "Missing Release configuration for the share extension"
          );
        }
        const uuid = project.generateUuid();
        builds[uuid] = {
          ...builds[release.value],
          name: "Canary",
          buildSettings: { ...builds[release.value].buildSettings }
        };
        builds[`${uuid}_comment`] = "Canary";
        list.buildConfigurations.push({ value: uuid, comment: "Canary" });
      }
      for (const entry of list.buildConfigurations) {
        const build = builds[entry.value];
        if (!build?.buildSettings) {
          throw new Error(`Missing Xcode build configuration for ${name}`);
        }
        const canary = build.name?.replaceAll('"', "") === "Canary";
        const appId = canary ? `${bundleId}.canary` : bundleId;
        build.buildSettings[parentBundleIdSetting] =
          name === "IO" ? '"$(PRODUCT_BUNDLE_IDENTIFIER)"' : appId;
        if (name === extensionName) {
          const appBuildSettings = appBuildSettingsByConfiguration.get(
            build.name?.replaceAll('"', "")
          );
          if (
            !appBuildSettings ||
            appBuildSettings.CURRENT_PROJECT_VERSION === undefined ||
            !appInfo.CFBundleShortVersionString
          ) {
            throw new Error(
              `Missing host version settings for ${build.name} share extension configuration`
            );
          }
          build.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `${appId}.ShareExtension`;
          build.buildSettings.CURRENT_PROJECT_VERSION =
            appBuildSettings.CURRENT_PROJECT_VERSION;
          build.buildSettings.MARKETING_VERSION =
            appInfo.CFBundleShortVersionString;
        }
      }
    }
    const files = project.pbxFileReferenceSection();
    const source = Object.values(files).find(
      entry =>
        entry &&
        typeof entry === "object" &&
        entry.name?.replaceAll('"', "") === "ShareIntoViewController.swift"
    );
    if (!source) {
      throw new Error("Missing share extension source file");
    }
    source.path = `"${path.relative(
      path.join(mod.modRequest.platformProjectRoot, extensionName),
      path.join(__dirname, "ios", "ShareIntoViewController.swift")
    )}"`;
    return mod;
  });

  return withSharing(config, {
    ios: {
      enabled: true,
      appGroupId: `group.$(${parentBundleIdSetting})`,
      extensionBundleIdentifier: `${bundleId}.ShareExtension`,
      activationRule: singlePdfOrImageActivationRule
    },
    android: {
      enabled: true,
      singleShareMimeTypes: ["application/pdf", "image/*"]
    }
  });
};

module.exports = withSharePdf;
