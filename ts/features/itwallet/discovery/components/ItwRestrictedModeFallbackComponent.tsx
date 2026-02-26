import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { itwDisableItwActivation } from "../../common/store/actions/preferences";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ITW_ROUTES } from "../../navigation/routes";

type Props = {
  credentialType?: string;
};
export const ItwRestrictedModeFallbackComponent = ({
  credentialType
}: Props) => {
  const navigation = useIONavigation();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletActive = useIOSelector(itwLifecycleIsValidSelector);

  const dispatch = useIODispatch();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  useFocusEffect(
    useCallback(() => {
      dispatch(itwDisableItwActivation());
    }, [dispatch])
  );

  const handleDocIOIssuing = () => {
    if (isWalletActive) {
      machineRef.send({
        type: "start",
        mode: "issuance",
        level: "l2-fallback",
        credentialType
      });
      return;
    }
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: {
        level: "l2-fallback"
      }
    });
  };

  const navigateToWalletHomeScreen = useCallback(
    () =>
      navigation.replace(ROUTES.MAIN, {
        screen: ROUTES.WALLET_HOME,
        params: {}
      }),
    [navigation]
  );

  const action: OperationResultScreenContentProps["action"] = {
    label: I18n.t(
      "features.itWallet.discovery.continueWithoutItw.actions.continue"
    ),
    onPress: handleDocIOIssuing
  };

  const secondaryAction: OperationResultScreenContentProps["secondaryAction"] =
    {
      label: I18n.t(
        "features.itWallet.discovery.continueWithoutItw.actions.cancel"
      ),
      onPress: navigateToWalletHomeScreen
    };

  return (
    <OperationResultScreenContent
      testID="ItwRestrictedModeFallbackComponentTestID"
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
