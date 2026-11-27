import { useMemo } from "react";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { LoginFailure } from "../../../common/utils/loginFailure";
import CieExpiredOrInvalidScreen from "../screens/CieExpiredOrInvalidScreen";
import CieExtendedApduNotSupportedScreen from "../screens/CieExtendedApduNotSupportedScreen";
import CieUnexpectedErrorScreen from "../screens/CieUnexpectedErrorScreen";
import CieWrongCardScreen from "../screens/CieWrongCardScreen";
import { CieWrongPin } from "./CieWrongPin";

export type OneIdentityCieCardReaderFailureProps = {
  failure: LoginFailure;
};

export const OneIdentityCieCardReaderFailure = ({
  failure
}: OneIdentityCieCardReaderFailureProps) => {
  const debugInfo = useMemo(() => ({ failure }), [failure]);
  useDebugInfo(debugInfo);

  if (failure.kind !== "cieCard") {
    return null;
  }
  const { attemptsLeft, event } = failure.details;

  switch (event) {
    case "AUTHENTICATION_ERROR":
    case "ON_NO_INTERNET_CONNECTION": {
      return <CieUnexpectedErrorScreen />;
    }
    // CIE is Expired or Revoked
    case "CERTIFICATE_EXPIRED":
    case "CERTIFICATE_REVOKED": {
      return <CieExpiredOrInvalidScreen />;
    }
    case "EXTENDED_APDU_NOT_SUPPORTED": {
      return <CieExtendedApduNotSupportedScreen />;
    }
    // "Function not supported" seems to be TAG_ERROR_NFC_NOT_SUPPORTED
    // for the iOS SDK
    case "Function not supported":
    case "ON_TAG_DISCOVERED_NOT_CIE":
    case "TAG_ERROR_NFC_NOT_SUPPORTED": {
      return <CieWrongCardScreen />;
    }
    // The card is temporarily locked. Unlock is available by CieID app
    case "ON_CARD_PIN_LOCKED":
    case "ON_PIN_ERROR":
    case "PIN Locked":
      return (
        <CieWrongPin
          remainingCount={event === "ON_CARD_PIN_LOCKED" ? 0 : attemptsLeft}
        />
      );
    default:
      return null;
  }
};
