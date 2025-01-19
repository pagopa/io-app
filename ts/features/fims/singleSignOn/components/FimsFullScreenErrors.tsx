import { useMemo, useCallback } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  fimsAuthenticationErrorTagSelector,
  fimsDebugDataSelector
} from "../store/selectors";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { fimsCancelOrAbortAction } from "../store/actions";

export const FimsSSOFullScreenError = () => {
  const dispatch = useIODispatch();
  const errorTag = useIOSelector(fimsAuthenticationErrorTagSelector);
  const debugData = useIOSelector(fimsDebugDataSelector);

  const debugInfo = useMemo(
    () => ({
      fimsFailure: `${errorTag}: ${debugData}`
    }),
    [debugData, errorTag]
  );
  useDebugInfo(debugInfo);

  const handleClose = useCallback(
    () => dispatch(fimsCancelOrAbortAction()),
    [dispatch]
  );

  const getErrorComponentProps = (): OperationResultScreenContentProps => {
    switch (errorTag) {
      case "AUTHENTICATION":
        return {
          title: I18n.t("FIMS.consentsScreen.errorStates.authentication.title"),
          subtitle: I18n.t(
            "FIMS.consentsScreen.errorStates.authentication.body"
          ),
          isHeaderVisible: true,
          pictogram: "umbrellaNew",
          action: {
            label: I18n.t("global.buttons.close"),
            onPress: handleClose
          }
        };
      case "MISSING_INAPP_BROWSER":
        return {
          title: I18n.t(
            "FIMS.consentsScreen.errorStates.missingInAppBrowser.title"
          ),
          subtitle: I18n.t(
            "FIMS.consentsScreen.errorStates.missingInAppBrowser.body"
          ),
          isHeaderVisible: true,
          pictogram: "updateOS",
          action: {
            label: I18n.t("global.buttons.close"),
            onPress: handleClose
          }
        };
      default:
        return {
          title: I18n.t("FIMS.consentsScreen.errorStates.general.title"),
          subtitle: I18n.t("FIMS.consentsScreen.errorStates.general.body"),
          isHeaderVisible: true,
          pictogram: "umbrellaNew",
          action: {
            label: I18n.t("global.buttons.close"),
            onPress: handleClose
          }
        };
    }
  };
  return <OperationResultScreenContent {...getErrorComponentProps()} />;
};
