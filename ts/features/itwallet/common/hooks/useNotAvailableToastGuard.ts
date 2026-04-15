import { useIOToast } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";

/**
 * A hook that wraps a function to show a "feature not available" toast
 * if the user has an ITW PID credential.
 * This is useful for features that are not yet available for ITW credentials such as
 * support request.
 * @param fn The function to be wrapped
 */
export const useNotAvailableToastGuard = (
  fn: (...args: Array<any>) => void | Promise<void>
) => {
  const toast = useIOToast();
  const isItwPid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const guardFn = useCallback(() => {
    toast.info(I18n.t("features.itWallet.generic.featureUnavailable.title"));
  }, [toast]);

  return (...args: Array<any>) => (isItwPid ? guardFn() : fn(...args));
};
