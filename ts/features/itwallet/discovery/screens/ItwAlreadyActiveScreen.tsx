import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import ROUTES from "../../../../navigation/routes";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useIOSelector } from "../../../../store/hooks";
import { itwAuthLevelSelector } from "../../common/store/selectors/preferences";
import { trackItwAlreadyActivated } from "../analytics";
import { ItwFlow } from "../../analytics/utils/analyticsTypes";

export const ItwAlreadyActiveScreen = () => {
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const navigation = useIONavigation();
  const itwAuthLevel = useIOSelector(itwAuthLevelSelector);
  const itwFlow: ItwFlow = itwAuthLevel ?? "not_available";

  const navigateToWallet = () => {
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        }
      ]
    });
  };

  const handleClose = () => {
    navigation.pop();
  };

  useFocusEffect(
    useCallback(() => {
      trackItwAlreadyActivated(itwFlow);
    }, [itwFlow])
  );

  return (
    <OperationResultScreenContent
      pictogram="itWallet"
      title={I18n.t("features.itWallet.discovery.alreadyActive.title")}
      subtitle={I18n.t("features.itWallet.discovery.alreadyActive.content")}
      isHeaderVisible={false}
      action={{
        label: I18n.t("features.itWallet.discovery.alreadyActive.action"),
        accessibilityLabel: I18n.t(
          "features.itWallet.discovery.alreadyActive.action"
        ),
        onPress: navigateToWallet
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleClose
      }}
    />
  );
};
