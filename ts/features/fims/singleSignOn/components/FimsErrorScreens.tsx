import { useNavigation } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { useSelector } from "react-redux";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { fimsErrorStateSelector } from "../store/selectors";

const MissingIABComponent = () => {
  const navigation = useNavigation();
  return (
    <OperationResultScreenContent
      title={I18n.t(
        "FIMS.consentsScreen.errorStates.missingInAppBrowser.title"
      )}
      subtitle={I18n.t(
        "FIMS.consentsScreen.errorStates.missingInAppBrowser.body"
      )}
      pictogram={"updateOS"}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: navigation.goBack
      }}
    />
  );
};

const GenericErrorComponent = () => {
  const navigation = useNavigation();
  const genericError = useSelector(fimsErrorStateSelector);
  return (
    <OperationResultScreenContent
      title={
        // in the next PRs this will be substituted by a static "catch-all" error message
        genericError ?? I18n.t("FIMS.consentsScreen.errorStates.tempErrorBody")
      }
      pictogram="umbrellaNew"
      isHeaderVisible={true}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: navigation.goBack
      }}
    />
  );
};

const DebugErrorComponent = () => {
  const navigation = useNavigation();
  const debugErrorState = useSelector(fimsErrorStateSelector);
  return (
    <OperationResultScreenContent
      title={
        debugErrorState ??
        I18n.t("FIMS.consentsScreen.errorStates.tempErrorBody")
      }
      pictogram="umbrellaNew"
      isHeaderVisible={true}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: navigation.goBack
      }}
    />
  );
};

export const FimsSSOErrorScreen = ({
  errorTag
}: {
  errorTag: FIMS_SSO_ERROR_TAGS;
}) => {
  const navigation = useNavigation();
  const ErrorComponent = FimsSSOErrorStateMap[errorTag];
  // this forces headerSecondLevel removal on page entry,
  // since it is not intended by design
  React.useEffect(() => {
    navigation.setOptions({
      header: constNull
    });
  });
  return <ErrorComponent />;
};

export const FimsSSOErrorStateMap = {
  DEBUG: DebugErrorComponent,
  MISSING_INAPP_BROWSER: MissingIABComponent,
  GENERIC: GenericErrorComponent
} as const;
export type FIMS_SSO_ERROR_TAGS = keyof typeof FimsSSOErrorStateMap;
