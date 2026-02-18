import { IOToast } from "@pagopa/io-app-design-system";
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
import { openWebUrl } from "../../../../utils/url";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { itwDisableItwActivation } from "../../common/store/actions/preferences";

// TODO: è questo l'url???
const FAQ_URL =
  "https://assistenza.ioapp.it/hc/it/articles/35541811236113-Cosa-serve-per-usare-IT-Wallet";

export const ItwKONoCieComponent = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  useFocusEffect(
    useCallback(() => {
      dispatch(itwDisableItwActivation());
    }, [dispatch])
  );

  const handleOpenFaq = () =>
    openWebUrl(FAQ_URL, () => IOToast.error(I18n.t("genericError")));

  const navigateToWalletHome = useCallback(
    () =>
      navigation.replace(ROUTES.MAIN, {
        screen: ROUTES.WALLET_HOME,
        params: {}
      }),
    [navigation]
  );

  const action: OperationResultScreenContentProps["action"] = {
    label: I18n.t("features.itWallet.discovery.koNoCie.actions.continue"),
    onPress: handleOpenFaq
  };

  const secondaryAction: OperationResultScreenContentProps["secondaryAction"] =
    {
      label: I18n.t("features.itWallet.discovery.koNoCie.actions.cancel"),
      onPress: navigateToWalletHome
    };

  return (
    <OperationResultScreenContent
      testID="itwKONoCieComponentTestID"
      title={I18n.t("features.itWallet.discovery.koNoCie.title")}
      subtitle={I18n.t("features.itWallet.discovery.koNoCie.subtitle")}
      pictogram="attention"
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};
