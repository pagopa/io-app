import { useCallback } from "react";
import { Route, useRoute } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackCieIdNoWhitelistUrl } from "../analytics";
import i18n from "../../../../../i18n";
import { IDENTIFICATION_ROUTES } from "../../../common/navigation/routes";

export type UrlNotCompliant = { url: string };
const CieIdAuthUrlError = () => {
  const route =
    useRoute<
      Route<typeof IDENTIFICATION_ROUTES.CIE_ID_INCORRECT_URL, UrlNotCompliant>
    >();
  const { url } = route.params;
  const navigation = useIONavigation();

  useOnFirstRender(() => {
    trackCieIdNoWhitelistUrl(url);
  });

  const handleClose = useCallback(() => {
    navigation.navigate(IDENTIFICATION_ROUTES.MAIN, {
      screen: IDENTIFICATION_ROUTES.LANDING
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
