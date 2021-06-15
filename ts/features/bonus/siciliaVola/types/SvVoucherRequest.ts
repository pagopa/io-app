type State = {
  id: number;
  name: string;
};
type Region = {
  id: number;
  name: string;
};
type Province = {
  id: number;
  name: string;
};

type Municipality = {
  id: number;
  name: string;
};
type University = {
  universityName: string;
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

export type VoucherRequest = DisableVoucherRequest | StudentVoucherRequest;

export type Category = VoucherRequest["category"];
