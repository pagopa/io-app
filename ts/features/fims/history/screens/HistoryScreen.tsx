/* eslint-disable functional/immutable-data */
import { IOToast } from "@pagopa/io-app-design-system";
import { useRef, useEffect, useCallback } from "react";
import I18n from "i18next";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  trackHistoryFailure,
  trackHistoryScreen
} from "../../common/analytics";
import { FimsUpdateAppAlert } from "../../common/components/FimsUpdateAppAlert";
import { FimsHistoryEmptyContent } from "../components/FimsHistoryEmptyContent";
import { FimsHistoryKoScreen } from "../components/FimsHistoryKoScreen";
import { FimsHistoryNonEmptyContent } from "../components/FimsHistoryNonEmptyContent";
import { fimsHistoryGet, resetFimsHistoryState } from "../store/actions";
import {
  fimsHistoryErrorSelector,
  fimsHistoryToUndefinedSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();

  const requiresAppUpdate = useIOSelector(fimsRequiresAppUpdateSelector);
  const accesses = useIOSelector(fimsHistoryToUndefinedSelector);
  const historyErrorState = useIOSelector(fimsHistoryErrorSelector);
  const isHistoryLoading = useIOSelector(isFimsHistoryLoadingSelector);

  const lastErrorToastDate = useRef<number | null>(null);

  const shouldShowErrorToast = historyErrorState === "ALERT_ONLY";
  // ---------- HOOKS

  useHeaderSecondLevel({
    canGoBack: !requiresAppUpdate && !historyErrorState,
    title: "",
    supportRequest: true
  });

  useEffect(() => {
    if (!requiresAppUpdate) {
      trackHistoryScreen();
      dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }));
    } else {
      trackHistoryFailure("update_required");
    }
    return () => {
      // full reset in order to avoid wonky error toast behaviour
      dispatch(resetFimsHistoryState());
    };
  }, [dispatch, requiresAppUpdate]);

  useEffect(() => {
    if (shouldShowErrorToast) {
      // needed to avoid multiple state changes simultaneously
      lastErrorToastDate.current = Date.now();
      IOToast.error(I18n.t("FIMS.history.errorStates.toast"));
    }
  }, [shouldShowErrorToast]);

  const fetchMoreHistoryItems = useCallback(() => {
    const hasErrorTimeoutExpired = lastErrorToastDate.current
      ? Date.now() - lastErrorToastDate.current >= 500
      : true;

    if (hasErrorTimeoutExpired && accesses?.next) {
      dispatch(
        fimsHistoryGet.request({
          continuationToken: accesses.next
        })
      );
    }
  }, [accesses, dispatch]);

  // ---------- FAILURE CASES

  if (requiresAppUpdate) {
    return <FimsUpdateAppAlert />;
  }

  if (historyErrorState === "FULL_KO") {
    return <FimsHistoryKoScreen />;
  }

  // ---------- SUCCESS

  const shouldShowEmptyContent =
    !isHistoryLoading && (accesses?.data ?? []).length === 0;

  return shouldShowEmptyContent ? (
    <FimsHistoryEmptyContent />
  ) : (
    <FimsHistoryNonEmptyContent
      accesses={accesses}
      fetchMore={fetchMoreHistoryItems}
    />
  );
};
