export type State = {
  id: number;
  name: string;
};
export type Region = {
  id: number;
  name: string;
};
export type Province = {
  id: number;
  name: string;
};

export type Municipality = {
  id: number;
  name: string;
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

export type DisabledVoucherRequest = {
  category: "disabled";
  departureDate: Date;
  returnDate?: Date;
};

export type StudentVoucherRequest = {
  category: "student";
  university: University;
  departureDate: Date;
  returnDate?: Date;
};

export type WorkerVoucherRequest = {
  category: "worker";
  underThresholdIncome: boolean;
  company: Company;
  departureDate: Date;
  returnDate?: Date;
};

export type SickVoucherRequest = {
  category: "sick";
  underThresholdIncome: boolean;
  hospital: Hospital;
  departureDate: Date;
  returnDate?: Date;
};

type PartialDisabledVoucherRequest = Partial<
  Omit<DisabledVoucherRequest, "category">
> &
  Pick<DisabledVoucherRequest, "category">;
type PartialStudentVoucherRequest = Partial<
  Omit<StudentVoucherRequest, "category">
> &
  Pick<StudentVoucherRequest, "category">;
type PartialWorkerVoucherRequest = Partial<
  Omit<WorkerVoucherRequest, "category">
> &
  Pick<WorkerVoucherRequest, "category">;
type PartialSickVoucherRequest = Partial<Omit<SickVoucherRequest, "category">> &
  Pick<SickVoucherRequest, "category">;

export type VoucherRequest =
  | DisabledVoucherRequest
  | StudentVoucherRequest
  | WorkerVoucherRequest
  | SickVoucherRequest;

export type PartialVoucherRequest =
  | PartialSickVoucherRequest
  | PartialDisabledVoucherRequest
  | PartialStudentVoucherRequest
  | PartialWorkerVoucherRequest;

export type SvBeneficiaryCategory = VoucherRequest["category"];

export type AvailableDestinations = ReadonlyArray<string>;
