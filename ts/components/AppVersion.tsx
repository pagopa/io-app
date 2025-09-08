import { BodySmall, useIOTheme } from "@pagopa/io-app-design-system";
import { GestureResponderEvent, Pressable, View } from "react-native";
import I18n from "i18next";
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
      onPress={onPress}
      testID={testID}
      accessibilityLabel={appVersionText}
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
          numberOfLines={1}
          weight="Semibold"
          color={theme["textBody-tertiary"]}
        >
          {appVersionText}
        </BodySmall>
      </View>
    </Pressable>
  );
};

export default AppVersion;
