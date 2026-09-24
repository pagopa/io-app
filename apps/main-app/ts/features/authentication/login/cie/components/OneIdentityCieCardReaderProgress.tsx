import I18n from "i18next";
import { ComponentProps } from "react";

import { isIos } from "../../../../../utils/platform";
import { CieManagerState } from "../hooks/useCieManager";
import { OneIdentityCieCardReaderProgressContent } from "./OneIdentityCieCardReaderProgressContent";

type OneIdentityCieCardReaderProgressProps = {
  onCancel: () => void;
  onRetry: () => void;
  state: Exclude<CieManagerState, { status: "failure" }>;
};

export const OneIdentityCieCardReaderProgress = ({
  onRetry,
  onCancel,
  state
}: OneIdentityCieCardReaderProgressProps) => {
  const closeAction = {
    label: I18n.t("global.buttons.close"),
    onPress: onCancel
  };

  const retryAction = {
    label: I18n.t("authentication.cie.nfc.retry"),
    onPress: onRetry
  };

  const actionsProps = isIos
    ? { primaryAction: retryAction, secondaryAction: closeAction }
    : { primaryAction: undefined, secondaryAction: closeAction };

  const getContentProps = (): ComponentProps<
    typeof OneIdentityCieCardReaderProgressContent
  > => {
    switch (state.status) {
      case "idle":
        return isIos
          ? {
              pictogram: "nfcScaniOS",
              status: "idle",
              title: I18n.t("authentication.cie.card.titleiOS"),
              subtitle: I18n.t(
                "authentication.cie.card.layCardMessageHeaderiOS"
              ),
              ...actionsProps
            }
          : {
              pictogram: "nfcScanAndroid",
              status: "idle",
              title: I18n.t("authentication.cie.card.title"),
              subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
              content: I18n.t("authentication.cie.card.layCardMessageFooter"),
              ...actionsProps
            };

      case "reading":
        return isIos
          ? {
              pictogram: "nfcScaniOS",
              status: "reading",
              title: I18n.t("authentication.cie.card.readerCardTitle"),
              content: I18n.t("authentication.cie.card.readerCardFooter"),
              ...actionsProps
            }
          : {
              pictogram: "nfcScanAndroid",
              status: "reading",
              title: I18n.t("authentication.cie.card.readerCardTitle"),
              content: I18n.t("authentication.cie.card.readerCardFooter"),
              ...actionsProps
            };

      case "reading-failure":
        return isIos
          ? {
              pictogram: "empty",
              status: "error",
              title: I18n.t(
                "authentication.cie.card.error.readerCardLostTitle"
              ),
              ...actionsProps
            }
          : {
              pictogram: "empty",
              status: "error",
              title: I18n.t(
                "authentication.cie.card.error.readerCardLostTitle"
              ),
              subtitle: I18n.t("authentication.cie.card.error.onTagLost"),
              ...actionsProps
            };

      case "success":
        return {
          pictogram: "success",
          status: "success",
          title: I18n.t("authentication.cie.card.cieCardValid"),
          content: I18n.t("authentication.cie.card.cieCardValid")
        };
    }
  };

  const contentProps = getContentProps();
  return <OneIdentityCieCardReaderProgressContent {...contentProps} />;
};
