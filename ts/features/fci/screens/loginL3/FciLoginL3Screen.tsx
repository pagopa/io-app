import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  setStartActiveSessionLogin,
  setIdpSelectedActiveSessionLogin,
  setActiveSessionLoginFlow
} from "../../../authentication/activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes";
import { IdpCIE } from "../../../authentication/login/hooks/useNavigateToLoginMethod";
import { Identifier } from "../../../authentication/login/optIn/screens/OptInScreen";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciEndRequest } from "../../store/actions";
import { fciSignatureRequestIdSelector } from "../../store/reducers/fciSignatureRequest";

export const FciLoginL3Screen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);

  return (
    <OperationResultScreenContent
      title={I18n.t("features.fci.requestL3.title")}
      subtitle={I18n.t("features.fci.requestL3.subtitle")}
      action={{
        label: I18n.t("features.fci.requestL3.action"),
        onPress: () => {
          dispatch(setStartActiveSessionLogin());
          dispatch(setIdpSelectedActiveSessionLogin(IdpCIE));
          dispatch(
            setActiveSessionLoginFlow({
              type: "FCI",
              route:
                (FCI_ROUTES.MAIN,
                {
                  screen: FCI_ROUTES.ROUTER,
                  params: { signatureRequestId }
                })
            })
          );
          navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
            screen: SETTINGS_ROUTES.AUTHENTICATION,
            params: {
              screen: AUTHENTICATION_ROUTES.OPT_IN,
              params: { identifier: Identifier.CIE }
            }
          });
        }
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: () => {
          dispatch(fciEndRequest());
        }
      }}
      pictogram={"identityCheck"}
    />
  );
};
