import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";

export const openNotAvailableToast = () =>
  IOToast.info(I18n.t("features.itWallet.generic.featureUnavailable.title"));
