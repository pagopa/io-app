export type CdcBonusRequestStatus =
  | "Activable"
  | "Active"
  | "Pending"
  | "Expired"
  | "NotRequestable";

export type CdcBonusRequest = {
  id: string;
  year: number;
  status: CdcBonusRequestStatus;
};

export type CdcBonusRequestList = ReadonlyArray<CdcBonusRequest>;
