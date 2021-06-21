type State = {
  id: number;
  name?: string;
};
type Region = {
  id: number;
  name?: string;
};
type Province = {
  id: number;
  name?: string;
};

type Municipality = {
  id: number;
  name?: string;
};
export type University = {
  universityName: string;
  state: State;
  region: Region;
  province: Province;
  municipality: Municipality;
};

export type Company = {
  businessName: string;
  vat: string;
  state: State;
  region: Region;
  province: Province;
  municipality: Municipality;
};

export type Hospital = {
  hospitalName: string;
  state: State;
  region: Region;
  province: Province;
  municipality: Municipality;
};

export type DisableVoucherRequest = {
  category: "disable";
  departureDate?: Date;
  arriveDate?: Date;
};

export type StudentVoucherRequest = {
  category: "student";
  university?: University;
  departureDate?: Date;
  arriveDate?: Date;
};

export type WorkerVoucherRequest = {
  category: "worker";
  subThresholdIncome?: boolean;
  company?: Company;
  departureDate?: Date;
  arriveDate?: Date;
};

export type SickVoucherRequest = {
  category: "sick";
  subThresholdIncome?: boolean;
  hospital?: Hospital;
  departureDate?: Date;
  arriveDate?: Date;
};

export type VoucherRequest =
  | DisableVoucherRequest
  | StudentVoucherRequest
  | WorkerVoucherRequest
  | SickVoucherRequest;

export type SvBeneficiaryCategory = VoucherRequest["category"];

export type AvailableDestination = ReadonlyArray<string>;
