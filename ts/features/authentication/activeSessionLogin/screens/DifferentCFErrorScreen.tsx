import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { clearCurrentSession } from "../../common/store/actions";
import { setFinishedActiveSessionLoginFlow } from "../store/actions";

export const DifferentCFErrorScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const handleNavigateToLandingScreen = () => {
    // finish active session login flow
    dispatch(setFinishedActiveSessionLoginFlow());
    // the user is logged out
    dispatch(clearCurrentSession());
    // navigate to landing screen
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  };

  return (
    <OperationResultScreenContent
      testID="different-cf-error"
      pictogram="umbrella"
      title={I18n.t("authentication.auth_errors.not_same_cf.title")}
      isHeaderVisible={false}
      subtitle={I18n.t("authentication.auth_errors.not_same_cf.subtitle")}
      action={{
        label: I18n.t("authentication.auth_errors.not_same_cf.button"),
        onPress: handleNavigateToLandingScreen
      }}
    />
  );
};
