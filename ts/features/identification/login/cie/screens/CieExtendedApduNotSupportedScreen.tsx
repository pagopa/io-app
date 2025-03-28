/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback } from "react";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { IDENTIFICATION_ROUTES } from "../../../common/navigation/routes";

const CieExtendedApduNotSupportedScreen = () => {
  const navigation = useIONavigation();

  const navigateToAuthenticationScreen = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: IDENTIFICATION_ROUTES.MAIN }]
    });
  }, [navigation]);

  const action = {
    label: I18n.t("global.buttons.close"),
    onPress: navigateToAuthenticationScreen
  };

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t("authentication.cie.card.error.genericErrorTitle")}
      subtitle={I18n.t("authentication.cie.nfc.apduNotSupported")}
      action={action}
    />
  );
};

export default CieExtendedApduNotSupportedScreen;
