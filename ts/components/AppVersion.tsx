import * as React from "react";
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  View
} from "react-native";
import I18n from "i18n-js";
import { getAppVersion } from "../utils/appVersion";
import { WithTestID } from "../types/WithTestID";
import { Icon } from "./core/icons";
import { HSpacer } from "./core/spacer/Spacer";
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

  return (
    <Pressable onPress={onPress} testID={testID}>
      <View style={[styles.versionButton, IOStyles.row, IOStyles.alignCenter]}>
        <Icon name="productIOApp" size={20} color="grey-650" />
        <HSpacer size={8} />
        <LabelSmall numberOfLines={1} weight="SemiBold" color="grey-650">
          {`${I18n.t("profile.main.appVersion")} ${appVersion}`}
        </LabelSmall>
      </View>
    </Pressable>
  );
};

export default AppVersion;
