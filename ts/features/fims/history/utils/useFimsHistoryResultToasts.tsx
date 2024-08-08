import { constVoid } from "fp-ts/lib/function";
import * as React from "react";
import * as RemoteValue from "../../../../common/model/RemoteValue";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsHistoryExportStateSelector } from "../store/selectors";
import {
  showFimsAlreadyExportingAlert,
  showFimsExportError,
  showFimsExportSuccess
} from "../utils";
import { resetFimsHistoryExportState } from "../store/actions";

export const useFimsHistoryResultToasts = () => {
  const historyExportState = useIOSelector(fimsHistoryExportStateSelector);
  const dispatch = useIODispatch();

  React.useEffect(() => {
    RemoteValue.fold(
      historyExportState,
      constVoid,
      constVoid,
      value =>
        value === "SUCCESS"
          ? showFimsExportSuccess()
          : showFimsAlreadyExportingAlert(),
      showFimsExportError
    );
  }, [historyExportState, dispatch]);

  // cleanup
  React.useEffect(
    () => () => {
      dispatch(resetFimsHistoryExportState());
    },
    [dispatch]
  );
};
