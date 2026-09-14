import { ItwFlow, ItwIdMethod } from "../../analytics/utils/types";

export enum CieCardReadingFailureReason {
  APDU_ERROR = "APDU_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  GENERIC_ERROR = "GENERIC_ERROR",
  KO = "KO",
  NO_INTERNET_CONNECTION = "NO_INTERNET_CONNECTION",
  ON_TAG_DISCOVERED_NOT_CIE = "ON_TAG_DISCOVERED_NOT_CIE",
  START_NFC_ERROR = "START_NFC_ERROR",
  STOP_NFC_ERROR = "STOP_NFC_ERROR"
}

export type ItwFallbackL2Flow = {
  fallback_reason: "nfc_not_supported" | "user_without_cie";
};

export type ItwUserWithoutL3requirements = {
  position: "bottom_sheet" | "screen";
  reason: "user_without_cie" | "user_without_pin";
  screen_name: string;
};

export type TrackCieCanProperties = {
  ITW_ID_method?: ItwIdMethod;
};

export type TrackCieScreenProperties = {
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
};

export type TrackIdMethodBottomsheetProperties = {
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
};

export type TrackItWalletCardReadingClose = {
  cie_reading_progress: number;
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
};

export type TrackItWalletCieCardReadingFailure = {
  cie_reading_progress: number;
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
  reason: CieCardReadingFailureReason;
};

export type TrackItWalletCieCardReadingUnexpectedFailure = {
  cie_reading_progress: number;
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
  origin: string | undefined;
  reason: string | undefined;
};

export type TrackItWalletCieCardVerifyFailure = {
  cie_reading_progress: number;
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
  reason: CieCardVerifyFailureReason;
};

export type TrackItWalletErrorCardReading = {
  cie_reading_progress: number;
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
};

export type TrackITWalletSpidIDPSelected = {
  idp: string;
  itw_flow: ItwFlow;
};

type CieCardVerifyFailureReason = "CERTIFICATE_EXPIRED" | "CERTIFICATE_REVOKED";
