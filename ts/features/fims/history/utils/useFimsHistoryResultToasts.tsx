import { IOToast } from "@pagopa/io-app-design-system";
import { constVoid } from "fp-ts/lib/function";
import * as React from "react";
import { Alert } from "react-native";
import * as RemoteValue from "../../../../common/model/RemoteValue";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  fimsHistoryExport,
  resetFimsHistoryExportState
} from "../store/actions";
import { fimsHistoryExportStateSelector } from "../store/selectors";

const showFimsExportError = () =>
  IOToast.error(I18n.t("FIMS.history.exportData.errorToast"));

const showFimsExportSuccess = () =>
  IOToast.success(I18n.t("FIMS.history.exportData.successToast"));

const showFimsAlreadyExportingAlert = (onPress: () => void) =>
  Alert.alert(
    I18n.t("FIMS.history.exportData.alerts.alreadyExporting.title"),
    I18n.t("FIMS.history.exportData.alerts.alreadyExporting.body"),
    [{ text: I18n.t("global.buttons.ok"), onPress }]
  );

export const useFimsHistoryExport = () => {
  const historyExportState = useIOSelector(fimsHistoryExportStateSelector);
  const dispatch = useIODispatch();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    RemoteValue.fold(
      historyExportState,
      constVoid,
      constVoid,
      value => {
        if (value === "SUCCESS") {
          showFimsExportSuccess();
          setIsLoading(false);
        } else {
          showFimsAlreadyExportingAlert(() => setIsLoading(false));
        }
      },
      () => {
        showFimsExportError();
        setIsLoading(false);
      }
    );
  }, [historyExportState, dispatch]);

  // cleanup
  React.useEffect(
    () => () => {
      dispatch(resetFimsHistoryExportState());
    },
    [dispatch]
  );

  const handleExportOnPress = () =>
    Alert.alert(
      I18n.t("FIMS.history.exportData.alerts.areYouSure"),
      undefined,
      [
        { text: I18n.t("global.buttons.cancel"), style: "cancel" },
        {
          text: I18n.t("global.buttons.confirm"),
          isPreferred: true,
          onPress: () => {
            if (!isLoading) {
              setIsLoading(true);
              dispatch(fimsHistoryExport.request());
            }
          }
        }
      ]
    );

  return {
    handleExportOnPress
  };
};
