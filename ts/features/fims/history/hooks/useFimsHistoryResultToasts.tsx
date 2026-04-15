/* eslint-disable functional/immutable-data */
import { IOToast } from "@pagopa/io-app-design-system";
import { constVoid } from "fp-ts/lib/function";
import { useRef, useEffect } from "react";
import { Alert } from "react-native";
import I18n from "i18next";
import * as RemoteValue from "../../../../common/model/RemoteValue";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  fimsHistoryExport,
  resetFimsHistoryExportState
} from "../store/actions";
import { fimsHistoryExportStateSelector } from "../store/selectors";
import { trackExportHistory } from "../../common/analytics";

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
  const isProcessing = useRef<boolean>(false);

  useEffect(() => {
    RemoteValue.fold(
      historyExportState,
      constVoid,
      constVoid,
      value => {
        if (value === "SUCCESS") {
          showFimsExportSuccess();
          isProcessing.current = false;
        } else {
          showFimsAlreadyExportingAlert(() => (isProcessing.current = false));
        }
      },
      () => {
        showFimsExportError();
        isProcessing.current = false;
      }
    );
  }, [historyExportState, dispatch]);

  // cleanup
  useEffect(
    () => () => {
      dispatch(resetFimsHistoryExportState());
    },
    [dispatch]
  );

  const handleExportOnPress = () => {
    if (!isProcessing.current) {
      Alert.alert(
        I18n.t("FIMS.history.exportData.alerts.areYouSure"),
        undefined,
        [
          { text: I18n.t("global.buttons.cancel"), style: "cancel" },
          {
            text: I18n.t("global.buttons.confirm"),
            isPreferred: true,
            onPress: () => {
              isProcessing.current = true;
              trackExportHistory();
              dispatch(fimsHistoryExport.request());
            }
          }
        ]
      );
    }
  };

  return {
    handleExportOnPress
  };
};
