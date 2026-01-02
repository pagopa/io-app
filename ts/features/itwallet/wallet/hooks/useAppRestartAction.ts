import { useIOToast } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import I18n from "i18next";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { resetOfflineAccessReason } from "../../../ingress/store/actions";
import { ItwOfflineRicaricaAppIOSource } from "../../analytics/utils/analyticsTypes";
import {
  trackItwOfflineRicaricaAppIO,
  trackItwOfflineReloadFailure
} from "../analytics";

/**
 * Hook that creates and manages a function to restart the application.
 *
 * @param source - The source of the app restart action, for analytics purposes
 * @returns A function to restart the application
 */
export const useAppRestartAction = (source: ItwOfflineRicaricaAppIOSource) => {
  const toast = useIOToast();
  const dispatch = useIODispatch();
  const isConnected = useIOSelector(isConnectedSelector);

  return useCallback(() => {
    if (isConnected) {
      trackItwOfflineRicaricaAppIO(source);
      // Reset the offline access reason.
      // Since this state is `undefined` when the user is online,
      // the startup saga will proceed without blocking.
      dispatch(resetOfflineAccessReason());
      // Dispatch this action to mount the correct navigator.
      dispatch(startupLoadSuccess(StartupStatusEnum.INITIAL));
      // restart startup saga
      dispatch(startApplicationInitialization());
    } else {
      toast.error(I18n.t("features.itWallet.offline.failure"));
      trackItwOfflineReloadFailure();
    }
  }, [dispatch, isConnected, toast, source]);
};
