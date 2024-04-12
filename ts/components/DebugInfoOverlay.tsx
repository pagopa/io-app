import {
  HSpacer,
  IOColors,
  IOStyles,
  hexToRgba,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import { ReduxProps } from "../store/actions/types";
import { useIOSelector } from "../store/hooks";
import { currentRouteSelector } from "../store/reducers/navigation";
import { isPagoPATestEnabledSelector } from "../store/reducers/persistedPreferences";
import { GlobalState } from "../store/reducers/types";
import { getAppVersion } from "../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import PagoPATestIndicator from "./PagoPATestIndicator";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

const debugItemBgColor = hexToRgba(IOColors.white, 0.4);
const debugItemBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  versionContainer: {
    ...StyleSheet.absoluteFillObject,
    top: -8,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  },
  versionText: {
    fontSize: 12,
    color: IOColors["grey-850"],
    ...makeFontStyleObject("SemiBold")
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
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);

  return (
    <SafeAreaView style={styles.versionContainer} pointerEvents="box-none">
      <View style={IOStyles.row}>
        <Pressable
          style={styles.versionTextWrapper}
          onPress={() => setShowRootName(prevState => !prevState)}
        >
          <Text style={styles.versionText}>{`v. ${appVersion}`}</Text>
        </Pressable>
        {isPagoPATestEnabled && (
          <>
            <HSpacer size={4} />
            <PagoPATestIndicator />
          </>
        )}
      </View>
      {showRootName && (
        <Pressable
          style={styles.routeText}
          onPress={() => clipboardSetStringWithFeedback(props.screenNameDebug)}
        >
          <Text style={styles.screenDebugText}>{props.screenNameDebug}</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  // We need to use the currentRouteDebugSelector because this component is outside the NavigationContext and otherwise
  // doesn't receive the updates about the new screens
  screenNameDebug: currentRouteSelector(state)
});

export default connect(mapStateToProps)(DebugInfoOverlay);
