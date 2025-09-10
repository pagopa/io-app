import { useIOToast } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import I18n from "i18next";
import { isItwCredential } from "../utils/itwCredentialUtils.ts";
import { StoredCredential } from "../utils/itwTypesUtils.ts";

export const useNotAvailableToastGuard = (
  fn: (...args: Array<any>) => any,
  storedCredential: StoredCredential
) => {
  const toast = useIOToast();
  const itwCredential = isItwCredential(storedCredential.credential);

  const guardFn = useCallback(() => {
    toast.info(I18n.t("features.itWallet.generic.featureUnavailable.title"));
    return undefined;
  }, [toast]);

  return (...args: Array<any>) => (itwCredential ? guardFn() : fn(...args));
};
