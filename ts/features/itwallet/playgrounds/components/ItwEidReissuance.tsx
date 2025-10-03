import { Alert, View } from "react-native";
import I18n from "i18next";
import { IOButton, ListItemHeader } from "@pagopa/io-app-design-system";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { useIOSelector } from "../../../../store/hooks";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwReissuanceSection = () => {
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const navigation = useIONavigation();

  // TODO [SIW-3091]: Remove isItwL3 from the condition when the L3 PID reissuance flow is ready
  if (!isWalletValid || isItwL3) {
    return null;
  }

  const confirmReissuance = () => {
    Alert.alert(
      I18n.t("features.itWallet.playgrounds.reissuing.alert.title"),
      I18n.t("features.itWallet.playgrounds.reissuing.alert.content"),
      [
        { text: I18n.t("global.buttons.cancel"), style: "cancel" },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
              params: {
                eidReissuing: true
              }
            });
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View>
      <ListItemHeader label="eID reissuance" />
      <IOButton
        variant="solid"
        color="danger"
        label="Start reissuance"
        onPress={confirmReissuance}
      />
    </View>
  );
};
