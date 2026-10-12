import type { NfcError } from "@io-app/expo-cie";

import CieExpiredOrInvalidScreen from "../screens/CieExpiredOrInvalidScreen";
import CieExtendedApduNotSupportedScreen from "../screens/CieExtendedApduNotSupportedScreen";
import CieUnexpectedErrorScreen from "../screens/CieUnexpectedErrorScreen";
import CieWrongCardScreen from "../screens/CieWrongCardScreen";
import { CieWrongPin } from "./CieWrongPin";

export type OneIdentityCieCardReaderFailureProps = {
  failure: NfcError;
};

export const OneIdentityCieCardReaderFailure = ({
  failure
}: OneIdentityCieCardReaderFailureProps) => {
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
    case "WRONG_PIN":
      return <CieWrongPin remainingCount={failure.attemptsLeft} />;
    default:
      return null;
  }
};
