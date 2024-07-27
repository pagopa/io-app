import {
  HStack,
  IOColors,
  Icon,
  hexToRgba,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import _ from "lodash";
import * as React from "react";
import { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import { ReduxProps } from "../store/actions/types";
import { useIOSelector } from "../store/hooks";
import { debugDataSelector } from "../store/reducers/debug";
import { currentRouteSelector } from "../store/reducers/navigation";
import { isPagoPATestEnabledSelector } from "../store/reducers/persistedPreferences";
import { GlobalState } from "../store/reducers/types";
import { getAppVersion } from "../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import PagoPATestIndicator from "./PagoPATestIndicator";
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
  versionText: {
    fontSize: 12,
    color: IOColors["grey-850"],
    ...makeFontStyleObject("Semibold")
  },
  screenDebugText: {
    fontSize: 12,
    color: IOColors["grey-850"],
    ...makeFontStyleObject("Regular")
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
    maxWidth: widthPercentageToDP(80),
    paddingHorizontal: 8,
    backgroundColor: debugItemBgColor,
    marginTop: 4
  }
});

const DebugInfoOverlay: React.FunctionComponent<Props> = (props: Props) => {
  const appVersion = getAppVersion();
  const [showRootName, setShowRootName] = useState(true);
  const [isDebugDataVisibile, showDebugData] = useState(false);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const debugData = useIOSelector(debugDataSelector);

  const appVersionText = `v. ${appVersion}`;

  return (
    <>
      <SafeAreaView style={styles.versionContainer} pointerEvents="box-none">
        <HStack space={4}>
          <Pressable
            style={styles.versionTextWrapper}
            onPress={() => setShowRootName(prevState => !prevState)}
            accessibilityRole="button"
            accessibilityLabel={appVersionText}
            accessibilityHint={"Tap here to show/hide the root name"}
          >
            <Text style={styles.versionText}>{appVersionText}</Text>
          </Pressable>
          {isPagoPATestEnabled && <PagoPATestIndicator />}
          {!_.isEmpty(debugData) && (
            <Pressable
              style={styles.versionTextWrapper}
              accessibilityRole="button"
              accessibilityHint={"Opend the debug data"}
              onPress={() => showDebugData(prevState => !prevState)}
            >
              <HStack space={4}>
                <Icon name="ladybug" size={12} />
                <Text style={styles.screenDebugText}>{_.size(debugData)}</Text>
              </HStack>
            </Pressable>
          )}
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
            <Text style={styles.screenDebugText}>{props.screenNameDebug}</Text>
          </Pressable>
        )}
      </SafeAreaView>
      {isDebugDataVisibile && (
        <DebugDataOverlay onDismissed={() => showDebugData(false)} />
      )}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  // We need to use the currentRouteDebugSelector because this component is outside the NavigationContext and otherwise
  // doesn't receive the updates about the new screens
  screenNameDebug: currentRouteSelector(state)
});

export default connect(mapStateToProps)(DebugInfoOverlay);
