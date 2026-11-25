import type { NfcError } from "@io-app/expo-cie";

import I18n from "i18next";
import { useMemo } from "react";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import CieExpiredOrInvalidScreen from "../screens/CieExpiredOrInvalidScreen";
import CieExtendedApduNotSupportedScreen from "../screens/CieExtendedApduNotSupportedScreen";
import CieUnexpectedErrorScreen from "../screens/CieUnexpectedErrorScreen";
import CieWrongCardScreen from "../screens/CieWrongCardScreen";
import { CieWrongPin } from "./CieWrongPin";
import { OneIdentityCieCardReaderProgressContent } from "./OneIdentityCieCardReaderProgressContent";

export type OneIdentityCieCardReaderFailureProps = {
  failure: NfcError;
  onCancel: () => void;
  onRetry: () => void;
};

export const OneIdentityCieCardReaderFailure = ({
  failure,
  onCancel,
  onRetry
}: OneIdentityCieCardReaderFailureProps) => {
  const debugInfo = useMemo(() => ({ failure }), [failure]);
  useDebugInfo(debugInfo);

  const closeAction = {
    label: I18n.t("global.buttons.close"),
    onPress: onCancel
  };

  const retryAction = {
    label: I18n.t("authentication.cie.nfc.retry"),
    onPress: onRetry
  };

  switch (failure.name) {
    case "APDU_ERROR": {
      return <CieExtendedApduNotSupportedScreen />;
    }
    case "AUTHENTICATION_ERROR":
    case "GENERIC_ERROR":
    case "NO_INTERNET_CONNECTION": {
      return <CieUnexpectedErrorScreen />;
    }
    // The card is temporarily locked. Unlock is available by CieID app
    case "CARD_BLOCKED":
      return <CieWrongPin remainingCount={0} />;
    // CIE is Expired or Revoked
    case "CERTIFICATE_EXPIRED":
    case "CERTIFICATE_REVOKED": {
      return <CieExpiredOrInvalidScreen />;
    }
    case "NOT_A_CIE": {
      return <CieWrongCardScreen />;
    }
    case "TAG_LOST":
      return (
        <OneIdentityCieCardReaderProgressContent
          pictogram="empty"
          primaryAction={retryAction}
          secondaryAction={closeAction}
          status="error"
          title={I18n.t("authentication.cie.card.error.readerCardLostTitle")}
        />
      );
    case "WRONG_PIN":
      return <CieWrongPin remainingCount={failure.attemptsLeft} />;
    default:
      return null;
  }
};
