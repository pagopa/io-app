import { ItwFlow } from "../../analytics/utils/analyticsTypes";

export type TrackITWalletSpidIDPSelected = { idp: string };

type CieCardVerifyFailureReason = "CERTIFICATE_EXPIRED" | "CERTIFICATE_REVOKED";

export type TrackItWalletCieCardVerifyFailure = {
  reason: CieCardVerifyFailureReason;
  itw_flow: ItwFlow;
  cie_reading_progress: number;
};

export type TrackItWalletCieCardReadingFailure = {
  reason: CieCardReadingFailureReason;
  itw_flow: ItwFlow;
  cie_reading_progress: number;
};

export type TrackItWalletCieCardReadingUnexpectedFailure = {
  reason: string | undefined;
  cie_reading_progress: number;
};

export enum CieCardReadingFailureReason {
  KO = "KO",
  ON_TAG_DISCOVERED_NOT_CIE = "ON_TAG_DISCOVERED_NOT_CIE",
  GENERIC_ERROR = "GENERIC_ERROR",
  APDU_ERROR = "APDU_ERROR",
  START_NFC_ERROR = "START_NFC_ERROR",
  STOP_NFC_ERROR = "STOP_NFC_ERROR",
  NO_INTERNET_CONNECTION = "NO_INTERNET_CONNECTION",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
}

export type ItwUserWithoutL3requirements = {
  screen_name: string;
  reason: "user_without_cie" | "user_without_pin";
  position: "screen" | "bottom_sheet";
};
