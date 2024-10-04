import { useNavigation } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { useSelector } from "react-redux";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { fimsErrorStateSelector } from "../store/selectors";
import { FIMS_SSO_ERROR_TAGS } from "../store/reducers";

export const FimsSSOFullScreenError = ({
  errorTag
}: {
  errorTag: FIMS_SSO_ERROR_TAGS;
}) => {
  const navigation = useNavigation();
  const errorText = useSelector(fimsErrorStateSelector);
  // this forces headerSecondLevel removal on page entry,
  // since it is not intended by design
  React.useEffect(() => {
    navigation.setOptions({
      header: constNull
    });
  });
  const getErrorComponentProps = (): OperationResultScreenContentProps => {
    switch (errorTag) {
      case "GENERIC":
      case "DEBUG":
        return {
          title:
            errorText ??
            I18n.t("FIMS.consentsScreen.errorStates.tempErrorBody"),
          pictogram: "umbrellaNew",
          isHeaderVisible: true,
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
          pictogram: "updateOS",
          action: {
            label: I18n.t("global.buttons.close"),
            onPress: navigation.goBack
          }
        };
    }
  };
  return <OperationResultScreenContent {...getErrorComponentProps()} />;
};
