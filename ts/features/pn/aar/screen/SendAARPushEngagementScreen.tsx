import { Badge, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  checkNotificationPermissions,
  openSystemNotificationSettingsScreen
} from "../../../pushNotifications/utils";

export const SendQrScanPushEngagementScreen = () => {
  const { shouldRenderBlankPage, onButtonPress } =
    useEngagementScreenFocusLogic();

  if (shouldRenderBlankPage) {
    return <></>;
  }

  return (
    <OperationResultScreenContent
      isHeaderVisible
      pictogram="notification"
      title={I18n.t("features.pn.aar.pushEngagement.title")}
      subtitle={I18n.t("features.pn.aar.pushEngagement.body")}
      topElement={<TopElement />}
      action={{
        label: I18n.t("features.pn.aar.pushEngagement.cta"),
        onPress: onButtonPress
      }}
    />
  );
};

const TopElement = () => (
  <View style={{ alignItems: "center" }}>
    <Badge
      variant="highlight"
      text={I18n.t("features.pn.aar.pushEngagement.badge")}
    />
    <VSpacer size={8} />
  </View>
);

const useEngagementScreenFocusLogic = () => {
  const navigation = useIONavigation();
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async nextAppState => {
        if (nextAppState === "active" && isButtonPressed) {
          const authorizationStatus = await checkNotificationPermissions();
          if (authorizationStatus) {
            IOToast.success(I18n.t("features.pn.aar.pushEngagement.toast"));
          }
          navigation.popToTop();
        }
      }
    );
    return () => {
      subscription.remove();
    };
  }, [isButtonPressed, navigation]);

  const onButtonPress = () => {
    navigation.setOptions({ headerShown: false });
    openSystemNotificationSettingsScreen();
    setIsButtonPressed(true);
  };

  return { shouldRenderBlankPage: isButtonPressed, onButtonPress };
};
