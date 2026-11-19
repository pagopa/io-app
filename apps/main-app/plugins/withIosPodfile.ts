import { type ConfigPlugin, withDangerousMod } from "expo/config-plugins";
import fs from "fs";
import path from "path";

import { insertOnce } from "./utils";

const DEPLOYMENT_TARGET_OVERRIDE = `

    # Aligns every pod to the app deployment target
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_configuration|
        build_configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = podfile_properties['ios.deploymentTarget'] || '15.1'
      end
    end`;

const FMT_WORKAROUND = `
  # TODO: Remove when https://github.com/expo/expo/issues/44229 gets resolved.
  # Workaround for fmt compilation error with Xcode 26 / newer Apple Clang
  post_integrate do |installer|
    fmt_base_h = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base_h)
      content = File.read(fmt_base_h)
      workaround = "#elif defined(__apple_build_version__)\\n#  define FMT_USE_CONSTEVAL 0  // consteval is broken in newer Apple clang too\\n"
      patched = content.include?(workaround) ? content : content.sub(
        '#elif defined(__cpp_consteval)',
        "#{workaround}#elif defined(__cpp_consteval)"
      )
      if patched != content
        File.chmod(0644, fmt_base_h)
        File.write(fmt_base_h, patched)
      end
    end
  end
`;

/**
 * Restores the Podfile hooks of the former committed project. Permissions are
 * handled by the react-native-permissions plugin and the deployment target by
 * expo-build-properties.
 */
const withIosPodfile: ConfigPlugin = config =>
  withDangerousMod(config, [
    "ios",
    dangerousConfig => {
      const podfilePath = path.join(
        dangerousConfig.modRequest.platformProjectRoot,
        "Podfile"
      );
      const fileName = "Podfile";
      const withDeploymentTarget = insertOnce(
        fs.readFileSync(podfilePath, "utf8"),
        {
          anchor:
            /:ccache_enabled => ccache_enabled\?\(podfile_properties\),\n {4}\)/,
          marker: "build_settings['IPHONEOS_DEPLOYMENT_TARGET']",
          position: "after",
          snippet: DEPLOYMENT_TARGET_OVERRIDE,
          fileName
        }
      );
      // post_integrate goes inside the app target, before its closing `end`
      const patched = insertOnce(withDeploymentTarget, {
        anchor: /\nend\s*$/,
        marker: "post_integrate do |installer|",
        position: "before",
        snippet: `\n${FMT_WORKAROUND.trimEnd()}`,
        fileName
      });
      fs.writeFileSync(podfilePath, patched);
      return dangerousConfig;
    }
  ]);

export default withIosPodfile;
