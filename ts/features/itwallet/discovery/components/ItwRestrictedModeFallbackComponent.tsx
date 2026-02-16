import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { itwDisableItwActivation } from "../../common/store/actions/preferences";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwRestrictedMode } from "../../identification/common/store/actions";

export const ItwRestrictedModeFallbackComponent = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  useFocusEffect(
    useCallback(() => {
      // TODO: add tracking
      dispatch(itwDisableItwActivation());
      dispatch(itwRestrictedMode(true));
    }, [dispatch])
  );

  const navigateToHomeScreen = useCallback(
    () =>
      navigation.replace(ROUTES.MAIN, {
        screen: ROUTES.WALLET_HOME,
        params: {}
      }),
    [navigation]
  );

  const navigateToDiscoveryInfoScreen = useCallback(
    () =>
      navigation.replace(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: {
          level: "l2-fallback"
        }
      }),
    [navigation]
  );

  const action: OperationResultScreenContentProps["action"] = {
    label: I18n.t(
      "features.itWallet.discovery.continueWithoutItw.actions.continue"
    ),
    onPress: navigateToDiscoveryInfoScreen
  };

  const secondaryAction: OperationResultScreenContentProps["secondaryAction"] =
    {
      label: I18n.t(
        "features.itWallet.discovery.continueWithoutItw.actions.cancel"
      ),
      onPress: navigateToHomeScreen
    };

  return (
    <OperationResultScreenContent
      testID="itwNfcNotSupportedComponentTestID"
      title={I18n.t("features.itWallet.discovery.continueWithoutItw.title")}
      subtitle={I18n.t(
        "features.itWallet.discovery.continueWithoutItw.subtitle"
      )}
      pictogram="cardAdd"
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};
