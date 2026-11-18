export type AvailableNfcAntenna = {
  locationX: number;
  locationY: number;
};

export type NfcAntennaConfidence = "high" | "low" | "medium";

export type NfcAntennaInfoResult = {
  availableNfcAntennas: ReadonlyArray<AvailableNfcAntenna>;
  deviceHeight: number;
  deviceWidth: number;
  isDeviceFoldable: boolean;
};

export type NfcAntennaPosition = "bottom" | "center" | "top";

export type NfcAntennaPositionInfo = {
  confidence: NfcAntennaConfidence;
  position: NfcAntennaPosition;
  source: "api" | "mapping";
};
