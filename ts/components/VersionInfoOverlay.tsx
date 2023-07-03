import * as React from "react";
import { StyleSheet, Pressable, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { useState } from "react";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { ReduxProps } from "../store/actions/types";
import { currentRouteSelector } from "../store/reducers/navigation";
import { GlobalState } from "../store/reducers/types";
import { getAppVersion } from "../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import { IOColors, hexToRgba } from "../components/core/variables/IOColors";
import { H5 } from "./core/typography/H5";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

const bgColor = hexToRgba(IOColors.white, 0.4);
const itemBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  versionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  },
  versionText: {
    borderColor: itemBorderColor,
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: bgColor
  },
  routeText: {
    borderColor: itemBorderColor,
    borderWidth: 1,
    borderRadius: 8,
    maxWidth: widthPercentageToDP(80),
    paddingHorizontal: 8,
    backgroundColor: bgColor,
    marginTop: 4
  }
});

const VersionInfoOverlay: React.FunctionComponent<Props> = (props: Props) => {
  const appVersion = getAppVersion();
  const [showRootName, setShowRootName] = useState(true);

  return (
    <SafeAreaView style={styles.versionContainer} pointerEvents="box-none">
      <Pressable
        style={styles.versionText}
        onPress={() => setShowRootName(prevState => !prevState)}
      >
        <H5 weight="SemiBold" color="bluegreyDark">{`v: ${appVersion}`}</H5>
      </Pressable>
      {showRootName && (
        <Pressable
          style={styles.routeText}
          onPress={() => clipboardSetStringWithFeedback(props.screenNameDebug)}
        >
          <H5 weight="Regular" color="bluegreyDark">
            {props.screenNameDebug}
          </H5>
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

export default connect(mapStateToProps)(VersionInfoOverlay);
