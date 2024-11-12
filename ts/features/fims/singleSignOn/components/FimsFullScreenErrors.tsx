import { useNavigation } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import {
  fimsAuthenticationErrorTagSelector,
  fimsDebugDataSelector
} from "../store/selectors";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";

export const FimsSSOFullScreenError = () => {
  const navigation = useNavigation();
  const errorTag = useIOSelector(fimsAuthenticationErrorTagSelector);
  const debugData = useIOSelector(fimsDebugDataSelector);
  const debugInfo = React.useMemo(
    () => ({
      fimsFailure: `${errorTag}: ${debugData}`
    }),
    [debugData, errorTag]
  );
  useDebugInfo(debugInfo);
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
            onPress: navigation.goBack
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
            onPress: navigation.goBack
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
            onPress: navigation.goBack
          }
        };
    }
  };
  return <OperationResultScreenContent {...getErrorComponentProps()} />;
};
