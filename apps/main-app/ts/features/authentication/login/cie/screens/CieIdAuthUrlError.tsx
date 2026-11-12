import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { setFinishedActiveSessionLoginFlow } from "../../../activeSessionLogin/store/actions";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { trackCieIdNoWhitelistUrl } from "../analytics";

export type CieIdAuthUrlErrorScreenParams = {
  url: string;
};

type CieIdAuthUrlErrorProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  typeof AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL
>;

const CieIdAuthUrlErrorScreen = ({
  navigation,
  route
}: CieIdAuthUrlErrorProps) => {
  const { url } = route.params;

  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  useOnFirstRender(() => {
    trackCieIdNoWhitelistUrl(url, isActiveSessionLogin ? "reauth" : "auth");
  });

  const debugInfo = useMemo(
    () => ({
      notAllowedUrl: url,
      flow: isActiveSessionLogin ? "reauth" : "auth"
    }),
    [url, isActiveSessionLogin]
  );
  useDebugInfo(debugInfo);

  const handleClose = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      // allows the user to return to the screen from which the flow began
      navigation.popToTop();
    } else {
      navigation.popTo(AUTHENTICATION_ROUTES.LANDING);
    }
  }, [dispatch, isActiveSessionLogin, navigation]);

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleClose
      }}
      pictogram="attention"
      subtitle={I18n.t("authentication.cieidUrlErrorScreen.description")}
      title={I18n.t("authentication.cieidUrlErrorScreen.title")}
    />
  );
};

export default CieIdAuthUrlErrorScreen;
