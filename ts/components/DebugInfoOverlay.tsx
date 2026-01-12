import {
  HStack,
  IOColors,
  IOText,
  VStack,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { FunctionComponent, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { connect } from "react-redux";
import { selectItwEnv } from "../features/itwallet/common/store/selectors/environment";
import { ReduxProps } from "../store/actions/types";
import { useIOSelector } from "../store/hooks";
import { currentRouteSelector } from "../store/reducers/navigation";
import { isPagoPATestEnabledSelector } from "../store/reducers/persistedPreferences";
import { GlobalState } from "../store/reducers/types";
import { getAppVersion } from "../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import PagoPATestIndicator from "./PagoPATestIndicator";
import { DebugDataIndicator } from "./debug/DebugDataIndicator";
import { DebugDataOverlay } from "./debug/DebugDataOverlay";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

const debugItemBgColor = hexToRgba(IOColors.white, 0.4);
const debugItemBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  versionContainer: {
    ...StyleSheet.absoluteFillObject,
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

const DebugInfoOverlay: FunctionComponent<Props> = (props: Props) => {
  const theme = useIOTheme();
  const appVersion = getAppVersion();
  const [showRootName, setShowRootName] = useState(true);
  const [isDebugDataVisibile, showDebugData] = useState(false);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);

  const insets = useSafeAreaInsets();

  const appVersionText = `v. ${appVersion}`;

  return (
    <>
      <View
        style={[styles.versionContainer, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <VStack space={4} style={{ alignItems: "center" }}>
          <HStack space={4}>
            <Pressable
              style={styles.versionTextWrapper}
              onPress={() => setShowRootName(prevState => !prevState)}
              accessibilityRole="button"
              accessibilityLabel={appVersionText}
              accessibilityHint={"Tap here to show/hide the root name"}
            >
              <IOText
                color={theme["textBody-secondary"]}
                font="TitilliumSansPro"
                weight="Semibold"
                size={12}
                lineHeight={16}
              >
                {appVersionText}
              </IOText>
            </Pressable>
            {isPagoPATestEnabled && <PagoPATestIndicator />}
            <ItwPreIndicator />
          </HStack>
          {showRootName && (
            <Pressable
              style={styles.routeText}
              accessibilityRole="button"
              accessibilityHint={"Copy the technical screen name"}
              onPress={() =>
                clipboardSetStringWithFeedback(props.screenNameDebug)
              }
            >
              <IOText
                color={theme["textBody-secondary"]}
                font="TitilliumSansPro"
                weight="Regular"
                size={12}
                lineHeight={16}
                style={{
                  textAlign: "center"
                }}
              >
                {props.screenNameDebug}
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
        weight="Semibold"
        size={12}
        lineHeight={16}
      >
        ITW PRE
      </IOText>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  // We need to use the currentRouteDebugSelector because this component is outside the NavigationContext and otherwise
  // doesn't receive the updates about the new screens
  screenNameDebug: currentRouteSelector(state)
});

export default connect(mapStateToProps)(DebugInfoOverlay);
