import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { setLggedOutUserWithDifferentCF } from "../store/actions";

export const DifferentCFErrorScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const handleNavigateToLandingScreen = () => {
    dispatch(setLggedOutUserWithDifferentCF());
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
