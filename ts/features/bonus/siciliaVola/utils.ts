import {
  DisabledVoucherRequest,
  PartialVoucherRequest,
  SickVoucherRequest,
  StudentVoucherRequest,
  VoucherRequest,
  WorkerVoucherRequest
} from "./types/SvVoucherRequest";

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
