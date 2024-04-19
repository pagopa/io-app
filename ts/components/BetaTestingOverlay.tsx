import * as React from "react";
import { FC, useState } from "react";
import { View, Platform, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { IOColors } from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAppVersion } from "../utils/appVersion";
import { Label } from "../components/core/typography/Label";
import { Body } from "../components/core/typography/Body";

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
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
  const insets = useSafeAreaInsets();

  const handleVisibility = (): void => setIsVisible(!isVisible);
  const bodyString = body ? `- ${body}` : "";

  return (
    <View
      style={[
        styles.versionContainer,
        {
          top: Platform.select({
            ios: 35 + insets.top,
            android: 0
          })
        }
      ]}
      pointerEvents="box-none"
    >
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
