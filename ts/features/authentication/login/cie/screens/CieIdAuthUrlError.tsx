import { useCallback } from "react";
import { Route, useRoute } from "@react-navigation/native";
import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackCieIdNoWhitelistUrl } from "../analytics";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { setFinishedActiveSessionLoginFlow } from "../../../activeSessionLogin/store/actions";

export type UrlNotCompliant = { url: string };
const CieIdAuthUrlError = () => {
  const route =
    useRoute<
      Route<typeof AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL, UrlNotCompliant>
    >();
  const { url } = route.params;
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  useOnFirstRender(() => {
    trackCieIdNoWhitelistUrl(url, isActiveSessionLogin);
  });

  const handleClose = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      // allows the user to return to the screen from which the flow began
      navigation.popToTop();
    } else {
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.LANDING
      });
    }
  }, [dispatch, isActiveSessionLogin, navigation]);

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
