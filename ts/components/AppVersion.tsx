import I18n from "i18n-js";
import * as React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import { WithTestID } from "../types/WithTestID";
import { getAppVersion } from "../utils/appVersion";
import { LabelSmall } from "./core/typography/LabelSmall";
import { IOStyles } from "./core/variables/IOStyles";

export type AppVersion = WithTestID<{
  onPress: (event: GestureResponderEvent) => void;
}>;

const styles = StyleSheet.create({
  versionButton: {
    paddingVertical: 20,
    alignSelf: "flex-start"
  }
});

const AppVersion = ({ onPress, testID }: AppVersion) => {
  const appVersion = getAppVersion();
  const appVersionText = `${I18n.t("profile.main.appVersion")} ${appVersion}`;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityLabel={appVersionText}
    >
      <View style={[styles.versionButton, IOStyles.row, IOStyles.alignCenter]}>
        <LabelSmall numberOfLines={1} weight="SemiBold" color="grey-650">
          {appVersionText}
        </LabelSmall>
      </View>
    </Pressable>
  );
};

export default AppVersion;
