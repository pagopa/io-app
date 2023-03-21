import * as React from "react";
import { FC, useState } from "react";
import { View, Platform, StyleSheet } from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getAppVersion } from "../utils/appVersion";
import { Label } from "../components/core/typography/Label";
import { Body } from "../components/core/typography/Body";
import { IOColors } from "../components/core/variables/IOColors";

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: Platform.select({
      ios: 35 + (isIphoneX() ? getStatusBarHeight() : 0),
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
    backgroundColor: IOColors.white,
    textAlign: "center"
  }
});

interface Props {
  title: string;
  body?: string;
}

export const BetaTestingOverlay: FC<Props> = ({ title, body }): JSX.Element => {
  const [isVisible, setIsVisible] = useState(true);

  const handleVisibility = (): void => setIsVisible(!isVisible);
  const bodyString = body ? `- ${body}` : "";

  return (
    <View style={styles.versionContainer} pointerEvents="box-none">
      {isVisible && (
        <TouchableOpacity onPress={handleVisibility}>
          <Label style={styles.versionText}>{title}</Label>
          <Body
            style={styles.versionText}
          >{`${getAppVersion()} ${bodyString}`}</Body>
        </TouchableOpacity>
      )}
    </View>
  );
};
