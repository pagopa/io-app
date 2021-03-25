import { View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";

import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { Body } from "../../../../components/core/typography/Body";
import { Label } from "../../../../components/core/typography/Label";
import { getAppVersion } from "../../../../utils/appVersion";

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: Platform.select({
      ios: 20 + (isIphoneX() ? getStatusBarHeight() : 0),
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
    backgroundColor: "#ffffffaa"
  }
});

/**
 * Temp overlay created to avoid ambiguity when test cgn versions are released.
 * @constructor
 */
export const CgnTestOverlay: React.FunctionComponent = () => (
  <View style={styles.versionContainer} pointerEvents="box-none">
    <Label style={styles.versionText}>{`🛠️ CGN TEST VERSION 🛠️`}</Label>
    <Body style={styles.versionText}>{`${getAppVersion()}`}</Body>
  </View>
);
