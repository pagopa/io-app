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
import { trackItwNfcNotSupported } from "../analytics";

const NFC_NOT_SUPPORTED_FAQ_URL =
  "https://assistenza.ioapp.it/hc/it/articles/35541811236113-Cosa-serve-per-usare-IT-Wallet";

export const ItwNfcNotSupportedComponent = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  useFocusEffect(
    useCallback(() => {
      trackItwNfcNotSupported();
      dispatch(itwDisableItwActivation());
    }, [dispatch])
  );

  const handleOpenFaq = () =>
    openWebUrl(NFC_NOT_SUPPORTED_FAQ_URL, () =>
      IOToast.error(I18n.t("genericError"))
    );

  const navigateToWalletHomeScreen = useCallback(
    () =>
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
      }),
    [navigation]
  );

  const action: OperationResultScreenContentProps["action"] = {
    label: I18n.t(
      "features.itWallet.discovery.nfcNotSupported.actions.continue"
    ),
    onPress: handleOpenFaq
  };

  const secondaryAction: OperationResultScreenContentProps["secondaryAction"] =
    {
      label: I18n.t(
        "features.itWallet.discovery.nfcNotSupported.actions.cancel"
      ),
      onPress: navigateToWalletHomeScreen
    };

  return (
    <OperationResultScreenContent
      testID="itwnfcNotSupportedComponentTestID"
      title={I18n.t("features.itWallet.discovery.nfcNotSupported.title")}
      subtitle={I18n.t("features.itWallet.discovery.nfcNotSupported.subtitle")}
      pictogram="attention"
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};
