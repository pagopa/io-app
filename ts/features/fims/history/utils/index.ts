import { IOToast } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import { Alert } from "react-native";
import I18n from "../../../../i18n";

export const showFimsExportError = () =>
  IOToast.error(I18n.t("FIMS.history.exportData.errorToast"));

export const showFimsExportSuccess = () =>
  IOToast.success(I18n.t("FIMS.history.exportData.successToast"));

export const showFimsAlreadyExportingAlert = () =>
  Alert.alert(
    I18n.t("FIMS.history.exportData.alerts.alreadyExporting.title"),
    I18n.t("FIMS.history.exportData.alerts.alreadyExporting.body"),
    [{ text: I18n.t("global.buttons.ok"), onPress: constNull }]
  );
