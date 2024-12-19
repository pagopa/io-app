import { useCallback } from "react";
import { Route, useRoute } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import ROUTES from "../../../../navigation/routes";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackCieIdNoWhitelistUrl } from "../../analytics";
import i18n from "../../../../i18n";

export type UrlNotCompliant = { url: string };
const CieIdAuthUrlError = () => {
  const route =
    useRoute<
      Route<typeof ROUTES.AUTHENTICATION_CIE_ID_INCORRECT_URL, UrlNotCompliant>
    >();
  const { url } = route.params;
  const navigation = useIONavigation();

  useOnFirstRender(() => {
    trackCieIdNoWhitelistUrl(url);
  });

  const handleClose = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_LANDING
    });
  }, [navigation]);

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={i18n.t("authentication.cieidUrlErrorScreen.title")}
      subtitle={i18n.t("authentication.cieidUrlErrorScreen.description")}
      action={{
        label: i18n.t("global.buttons.close"),
        accessibilityLabel: i18n.t("global.buttons.close"),
        onPress: handleClose
      }}
    />
  );
};

export default CieIdAuthUrlError;
