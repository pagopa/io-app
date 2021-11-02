import I18n from "../../../i18n";
import { AeroportiAmmessiInputBean } from "../../../../definitions/api_sicilia_vola/AeroportiAmmessiInputBean";
import { SvVoucher } from "./types/SvVoucher";
import {
  DisabledVoucherRequest,
  PartialVoucherRequest,
  SickVoucherRequest,
  StudentVoucherRequest,
  VoucherRequest,
  WorkerVoucherRequest
} from "./types/SvVoucherRequest";

export const fromVoucherToDestinationLabels = (voucher: SvVoucher) => {
  switch (voucher.category) {
    case "student":
      return [
        {
          label: I18n.t("bonus.sv.components.destinationLabels.universityName"),
          value: voucher.university.universityName
        },
        {
          label: I18n.t("bonus.sv.components.destinationLabels.municipality"),
          value: voucher.university.municipality.name
        }
      ];
    case "worker":
      return [
        {
          label: I18n.t("bonus.sv.components.destinationLabels.companyName"),
          value: voucher.company.businessName
        },
        {
          label: I18n.t("bonus.sv.components.destinationLabels.municipality"),
          value: voucher.company.municipality.name
        }
      ];
    case "sick":
      return [
        {
          label: I18n.t("bonus.sv.components.destinationLabels.hospitalName"),
          value: voucher.hospital.hospitalName
        },
        {
          label: I18n.t("bonus.sv.components.destinationLabels.municipality"),
          value: voucher.hospital.municipality.name
        }
      ];
    case "disabled":
      return [];
  }
};

const isStudentVoucherRequest = (
  partialVoucherRequest: PartialVoucherRequest
): partialVoucherRequest is StudentVoucherRequest =>
  partialVoucherRequest.category === "student" &&
  partialVoucherRequest.university !== undefined &&
  partialVoucherRequest.departureDate !== undefined;

const isWorkerVoucherRequest = (
  partialVoucherRequest: PartialVoucherRequest
): partialVoucherRequest is WorkerVoucherRequest =>
  partialVoucherRequest.category === "worker" &&
  partialVoucherRequest.underThresholdIncome !== undefined &&
  partialVoucherRequest.company !== undefined &&
  partialVoucherRequest.departureDate !== undefined;

const isSickVoucherRequest = (
  partialVoucherRequest: PartialVoucherRequest
): partialVoucherRequest is SickVoucherRequest =>
  partialVoucherRequest.category === "sick" &&
  partialVoucherRequest.underThresholdIncome !== undefined &&
  partialVoucherRequest.hospital !== undefined &&
  partialVoucherRequest.departureDate !== undefined;

const isDisabledVoucherRequest = (
  partialVoucherRequest: PartialVoucherRequest
): partialVoucherRequest is DisabledVoucherRequest =>
  partialVoucherRequest.category === "disabled" &&
  partialVoucherRequest.departureDate !== undefined;

export const isVoucherRequest = (
  partialVoucherRequest: PartialVoucherRequest
): partialVoucherRequest is VoucherRequest =>
  isStudentVoucherRequest(partialVoucherRequest) ||
  isWorkerVoucherRequest(partialVoucherRequest) ||
  isSickVoucherRequest(partialVoucherRequest) ||
  isDisabledVoucherRequest(partialVoucherRequest);

export const destinationsInfoFromVoucherRequest = (
  voucherRequest:
    | StudentVoucherRequest
    | WorkerVoucherRequest
    | SickVoucherRequest
): AeroportiAmmessiInputBean => {
  const destination =
    voucherRequest.category === "student"
      ? voucherRequest.university
      : voucherRequest.category === "worker"
      ? voucherRequest.company
      : voucherRequest.hospital;

  return {
    // TODO: check consistency between type in swagger.
    stato: destination.state.id.toString(),
    latitudine: destination.municipality.latitude,
    longitudine: destination.municipality.longitude
  };
};
