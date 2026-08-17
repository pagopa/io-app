import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { ItwFlow } from "../../analytics/utils/types";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { itwAuthLevelSelector } from "../../common/store/selectors/preferences";
import { trackItwAlreadyActivated } from "../analytics";

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
    navigation.popToTop();
  };

  useFocusEffect(
    useCallback(() => {
      trackItwAlreadyActivated(itwFlow);
    }, [itwFlow])
  );

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("features.itWallet.discovery.alreadyActive.action"),
        accessibilityLabel: I18n.t(
          "features.itWallet.discovery.alreadyActive.action"
        ),
        onPress: navigateToWallet
      }}
      pictogram="itWallet"
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleClose
      }}
      subtitle={I18n.t("features.itWallet.discovery.alreadyActive.content")}
      title={I18n.t("features.itWallet.discovery.alreadyActive.title")}
    />
  );
};
