import { BodySmall, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { GestureResponderEvent, Pressable, View } from "react-native";

import { WithTestID } from "../types/WithTestID";
import { getAppVersion } from "../utils/appVersion";

export type AppVersion = WithTestID<{
  onPress: (event: GestureResponderEvent) => void;
}>;

const AppVersion = ({ onPress, testID }: AppVersion) => {
  const theme = useIOTheme();
  const appVersion = getAppVersion();
  const appVersionText = `${I18n.t("profile.main.appVersion")} ${appVersion}`;

  return (
    <Pressable
      accessibilityLabel={appVersionText}
      onPress={onPress}
      testID={testID}
    >
      <View
        style={{
          paddingVertical: 20,
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <BodySmall
          color={theme["textBody-tertiary"]}
          numberOfLines={1}
          weight="Semibold"
        >
          {appVersionText}
        </BodySmall>
      </View>
    </Pressable>
  );
};

export default AppVersion;
