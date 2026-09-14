import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { useIODispatch } from "../../../../store/hooks";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { setLoggedOutUserWithDifferentCF } from "../store/actions";
import { trackLoginWithNewCF, trackLoginWithNewCFConfirm } from "./analytics";

export const DifferentCFErrorScreen = () => {
  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(setLoggedOutUserWithDifferentCF());
    void trackLoginWithNewCF();
  });

  const handleNavigateToLandingScreen = () => {
    dispatch(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED));
    dispatch(startApplicationInitialization());
    void trackLoginWithNewCFConfirm();
  };

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("authentication.auth_errors.not_same_cf.button"),
        onPress: handleNavigateToLandingScreen
      }}
      pictogram="umbrella"
      subtitle={I18n.t("authentication.auth_errors.not_same_cf.subtitle")}
      testID="different-cf-error"
      title={I18n.t("authentication.auth_errors.not_same_cf.title")}
    />
  );
};
