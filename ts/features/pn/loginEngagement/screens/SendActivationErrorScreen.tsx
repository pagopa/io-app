import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import ROUTES from "../../../../navigation/routes";

export const SendActivationErrorScreen = () => {
  const { replace } = useIONavigation();
  const dispatch = useIODispatch();

  useAvoidHardwareBackButton();

  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      pictogram="umbrella"
      title={i18n.t("features.pn.loginEngagement.send.activationErrorMessage")}
      action={{
        testID: "actionRetryID",
        label: i18n.t("global.buttons.retry"),
        onPress: () => {
          replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.SEND_ENGAGEMENT_ON_FIRST_APP_OPENING
            }
          });
        }
      }}
      secondaryAction={{
        testID: "actionCloseID",
        label: i18n.t("global.buttons.close"),
        onPress: () => {
          replace(ROUTES.MAIN, {
            screen: MESSAGES_ROUTES.MESSAGES_HOME
          });
          dispatch(setSecurityAdviceReadyToShow(true));
        }
      }}
    />
  );
};
