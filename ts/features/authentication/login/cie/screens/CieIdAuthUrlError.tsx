import { useCallback } from "react";
import { Route, useRoute } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackCieIdNoWhitelistUrl } from "../analytics";
import i18n from "../../../../../i18n";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { setFinishedActiveSessionLoginFlow } from "../../../activeSessionLogin/store/actions";
import ROUTES from "../../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";

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
    trackCieIdNoWhitelistUrl(url);
  });

  const handleClose = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      navigation.replace(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
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
