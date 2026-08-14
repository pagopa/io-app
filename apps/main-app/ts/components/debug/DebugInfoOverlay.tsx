import {
  hexToRgba,
  HStack,
  IOColors,
  IOText,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { FunctionComponent, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { selectItwEnv } from "../../features/itwallet/common/store/selectors/environment";
import { useCurrentRouteName } from "../../navigation/NavigationService";
import { useIOSelector } from "../../store/hooks";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { getAppVersion } from "../../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import PagoPATestIndicator from "../PagoPATestIndicator";
import { DebugDataIndicator } from "./DebugDataIndicator";
import { DebugDataOverlay } from "./DebugDataOverlay";

const debugItemBgColor = hexToRgba(IOColors.white, 0.4);
const debugItemBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  versionContainer: {
    ...StyleSheet.absoluteFill,
    top: Platform.OS === "android" ? 0 : -8,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  },
  versionTextWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: debugItemBorderColor,
    borderWidth: 1,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: debugItemBgColor
  },
  routeText: {
    borderColor: debugItemBorderColor,
    borderWidth: 1,
    borderRadius: 8,
    maxWidth: "80%",
    paddingHorizontal: 8,
    backgroundColor: debugItemBgColor
  }
});

const DebugInfoOverlay: FunctionComponent = () => {
  const theme = useIOTheme();
  const appVersion = getAppVersion();
  const [showRootName, setShowRootName] = useState(true);
  const [isDebugDataVisibile, showDebugData] = useState(false);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const screenNameDebug = useCurrentRouteName();

  const insets = useSafeAreaInsets();

  const appVersionText = `v. ${appVersion}`;

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[styles.versionContainer, { paddingTop: insets.top }]}
      >
        <VStack space={4} style={{ alignItems: "center" }}>
          <HStack space={4}>
            <Pressable
              accessibilityHint={"Tap here to show/hide the root name"}
              accessibilityLabel={appVersionText}
              accessibilityRole="button"
              onPress={() => setShowRootName(prevState => !prevState)}
              style={styles.versionTextWrapper}
            >
              <IOText
                color={theme["textBody-secondary"]}
                font="TitilliumSansPro"
                lineHeight={16}
                size={12}
                weight="Semibold"
              >
                {appVersionText}
              </IOText>
            </Pressable>
            {isPagoPATestEnabled && <PagoPATestIndicator />}
            <ItwPreIndicator />
          </HStack>
          {showRootName && (
            <Pressable
              accessibilityHint={"Copy the technical screen name"}
              accessibilityRole="button"
              onPress={() => clipboardSetStringWithFeedback(screenNameDebug)}
              style={styles.routeText}
            >
              <IOText
                color={theme["textBody-secondary"]}
                font="TitilliumSansPro"
                lineHeight={16}
                size={12}
                style={{
                  textAlign: "center"
                }}
                weight="Regular"
              >
                {screenNameDebug}
              </IOText>
            </Pressable>
          )}
          <DebugDataIndicator
            onPress={() => showDebugData(prevState => !prevState)}
          />
        </VStack>
      </View>
      {isDebugDataVisibile && (
        <DebugDataOverlay onDismissed={() => showDebugData(false)} />
      )}
    </>
  );
};

const ItwPreIndicator = () => {
  const itwEnv = useIOSelector(selectItwEnv);

  if (itwEnv !== "pre") {
    return null;
  }

  return (
    <View
      style={[
        styles.versionTextWrapper,
        {
          backgroundColor: hexToRgba(IOColors["error-500"], 0.4),
          borderColor: hexToRgba(IOColors["error-850"], 0.1)
        }
      ]}
    >
      <IOText
        color={"error-850"}
        font="TitilliumSansPro"
        lineHeight={16}
        size={12}
        weight="Semibold"
      >
        ITW PRE
      </IOText>
    </View>
  );
};

export default DebugInfoOverlay;
