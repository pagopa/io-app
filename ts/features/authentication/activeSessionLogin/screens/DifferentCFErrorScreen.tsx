import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setLoggedOutUserWithDifferentCF } from "../store/actions";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { cieLoginFlowSelector } from "../store/selectors";
import { trackLoginWithNewCF, trackLoginWithNewCFConfirm } from "./analytics";

export const DifferentCFErrorScreen = () => {
  const dispatch = useIODispatch();

  const cieLoginFlowType = useIOSelector(cieLoginFlowSelector);

  useOnFirstRender(() => {
    dispatch(setLoggedOutUserWithDifferentCF());
    void trackLoginWithNewCF(cieLoginFlowType);
  });

  const handleNavigateToLandingScreen = () => {
    dispatch(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED));
    dispatch(startApplicationInitialization());
    void trackLoginWithNewCFConfirm(cieLoginFlowType);
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
