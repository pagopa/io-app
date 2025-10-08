import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../store/hooks";
import { setLoggedOutUserWithDifferentCF } from "../store/actions";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { startApplicationInitialization } from "../../../../store/actions/application";

export const DifferentCFErrorScreen = () => {
  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(setLoggedOutUserWithDifferentCF());
  });

  const handleNavigateToLandingScreen = () => {
    dispatch(startApplicationInitialization());
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
