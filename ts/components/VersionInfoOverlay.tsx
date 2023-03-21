import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { connect } from "react-redux";
import { useState } from "react";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { ReduxProps } from "../store/actions/types";
import { currentRouteSelector } from "../store/reducers/navigation";
import { GlobalState } from "../store/reducers/types";
import { getAppVersion } from "../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import { IOColors, hexToRgba } from "../components/core/variables/IOColors";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

const bgColor = hexToRgba(IOColors.white, 0.67);

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: Platform.select({
      ios:
        20 + (isIphoneX() || DeviceInfo.hasNotch() ? getStatusBarHeight() : 0),
      android: 0
    }),
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  },

  versionText: {
    padding: 2,
    backgroundColor: bgColor,
    fontSize: 16,
    lineHeight: 24,
    color: IOColors.black
  },

  routeText: {
    maxWidth: widthPercentageToDP(80),
    padding: 2,
    backgroundColor: bgColor,
    fontSize: 14,
    lineHeight: 22,
    color: IOColors.black
  }
});

const VersionInfoOverlay: React.FunctionComponent<Props> = (props: Props) => {
  const appVersion = getAppVersion();
  const [showRootName, setShowRootName] = useState(true);

  return (
    <View style={styles.versionContainer} pointerEvents="box-none">
      <NBText
        style={styles.versionText}
        onPress={() => setShowRootName(prevState => !prevState)}
      >{`v: ${appVersion}`}</NBText>
      {showRootName && (
        <NBText
          style={styles.routeText}
          onPress={() => clipboardSetStringWithFeedback(props.screenNameDebug)}
        >
          {props.screenNameDebug}
        </NBText>
      )}
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  // We need to use the currentRouteDebugSelector because this component is outside the NavigationContext and otherwise
  // doesn't receive the updates about the new screens
  screenNameDebug: currentRouteSelector(state)
});

export default connect(mapStateToProps)(VersionInfoOverlay);
