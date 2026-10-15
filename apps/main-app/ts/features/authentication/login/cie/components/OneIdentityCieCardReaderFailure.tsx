import { Event as CEvent } from "@pagopa/react-native-cie";

import CieExpiredOrInvalidScreen from "../screens/CieExpiredOrInvalidScreen";
import CieExtendedApduNotSupportedScreen from "../screens/CieExtendedApduNotSupportedScreen";
import CieUnexpectedErrorScreen from "../screens/CieUnexpectedErrorScreen";
import CieWrongCardScreen from "../screens/CieWrongCardScreen";
import { CieWrongPin } from "./CieWrongPin";

export type OneIdentityCieCardReaderFailureProps = {
  failure: CEvent;
};

export const OneIdentityCieCardReaderFailure = ({
  failure
}: OneIdentityCieCardReaderFailureProps) => {
  switch (failure.event) {
    // "Function not supported" seems to be TAG_ERROR_NFC_NOT_SUPPORTED
    // for the iOS SDK
    case "Function not supported" as unknown:
    case "ON_TAG_DISCOVERED_NOT_CIE":
    case "TAG_ERROR_NFC_NOT_SUPPORTED": {
      return <CieWrongCardScreen />;
    }
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
    // The card is temporarily locked. Unlock is available by CieID app
    case "ON_CARD_PIN_LOCKED":
    case "ON_PIN_ERROR":
    case "PIN Locked":
      return (
        <CieWrongPin
          remainingCount={
            failure.event === "ON_CARD_PIN_LOCKED" ? 0 : failure.attemptsLeft
          }
        />
      );
    default:
      return null;
  }
};
