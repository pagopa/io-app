import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { isTestEnv } from "../../../utils/environment";
import { IOBarcode, IOBarcodeOrigin } from "../types/IOBarcode";
import { BarcodeFailure } from "../types/failure";

export type BarcodeAnalyticsFlow = "home" | "avviso" | "idpay"; // Should be extended for every feature
export type BarcodeAnalyticsCode =
  | "avviso"
  | "data_matrix"
  | "idpay"
  | "SEND"
  | "ITW presentazione remota"; // Should be extended for every feature
export type BarcodeAnalyticsDataEntry = "qr code" | "file";

const getEventCodeFromBarcode = (
  barcode: IOBarcode
): BarcodeAnalyticsCode | undefined => {
  if (barcode.type === "IDPAY") {
    return "idpay";
  }

  if (barcode.type === "PAGOPA") {
    return barcode.format === "DATA_MATRIX" ? "data_matrix" : "avviso";
  }

  if (barcode.type === "SEND") {
    return "SEND";
  }

  if (barcode.type === "ITW_REMOTE") {
    return "ITW presentazione remota";
  }

  return undefined;
};

const getDataEntryFromBarcodeOrigin = (
  origin: IOBarcodeOrigin
): BarcodeAnalyticsDataEntry | undefined => {
  if (origin === "camera") {
    return "qr code";
  }

  if (origin === "file") {
    return "file";
  }

  return undefined;
};

export const trackZendeskSupport = (
  screenName: string,
  flow: BarcodeAnalyticsFlow
) => {
  void mixpanelTrack(
    "ZENDESK_SUPPORT_START",
    buildEventProperties("UX", "action", {
      screen_name: screenName,
      isAssistanceForPayment: flow === "avviso",
      isAssistanceForCard: false,
      isAssistanceForFci: false
    })
  );
};

export const trackBarcodeCameraAuthorizationNotDetermined = () => {
  void mixpanelTrack(
    "QRCODE_CAMERA_AUTHORIZATION",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackBarcodeCameraAuthorizationDenied = () => {
  void mixpanelTrack(
    "QRCODE_CAMERA_AUTHORIZATION_2",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackBarcodeCameraAuthorized = () => {
  void mixpanelTrack(
    "QRCODE_CAMERA_AUTHORIZED",
    buildEventProperties("UX", "action")
  );
};

export const trackBarcodeCameraAuthorizedFromSettings = () => {
  void mixpanelTrack(
    "QRCODE_CAMERA_AUTHORIZED_2",
    buildEventProperties("UX", "action")
  );
};

export const trackBarcodeScanScreenView = (flow: BarcodeAnalyticsFlow) => {
  void mixpanelTrack(
    "QRCODE_SCAN_SCREEN",
    buildEventProperties("UX", "screen_view", { flow })
  );
};

export const trackBarcodeScanSuccess = (
  flow: BarcodeAnalyticsFlow,
  barcode: IOBarcode,
  origin: IOBarcodeOrigin
) => {
  const code = getEventCodeFromBarcode(barcode);
  const data_entry = getDataEntryFromBarcodeOrigin(origin);

  void mixpanelTrack(
    "QRCODE_SCAN_SUCCESS",
    buildEventProperties("UX", "action", { flow, code, data_entry })
  );
};

export const trackBarcodeNotFound = () => {
  void mixpanelTrack(
    "QRCODE_NO_CODE_FOUND",
    buildEventProperties("KO", undefined)
  );
};

export const trackBarcodeScanFailure = (
  flow: BarcodeAnalyticsFlow,
  failure: BarcodeFailure
) => {
  const trackFn = (internalFlow: BarcodeAnalyticsFlow, reason: string) => {
    void mixpanelTrack(
      "QRCODE_SCAN_FAILURE",
      buildEventProperties("KO", undefined, { flow: internalFlow, reason })
    );
  };

  switch (failure.reason) {
    case "UNSUPPORTED_FORMAT":
    case "INVALID_FILE":
      trackFn(flow, "qr code non valido");
      break;
    case "UNKNOWN_CONTENT":
      trackFn(flow, "qr code flusso sbagliato");
      break;
    case "BARCODE_NOT_FOUND":
      trackBarcodeNotFound();
      break;
  }
};

export const trackBarcodeMultipleCodesScreenView = () => {
  void mixpanelTrack(
    "QRCODE_MULTIPLE_CODES",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackBarcodeMultipleCodesSelection = () => {
  void mixpanelTrack(
    "QRCODE_MULTIPLE_CODES_SELECTION",
    buildEventProperties("UX", "action")
  );
};

export const trackBarcodeScanTorch = () => {
  void mixpanelTrack("QRCODE_SCAN_TORCH", buildEventProperties("UX", "action"));
};

export const trackBarcodeManualEntryPath = (flow: BarcodeAnalyticsFlow) => {
  void mixpanelTrack(
    "QRCODE_MANUAL_ENTRY_PATH",
    buildEventProperties("UX", "action", { flow })
  );
};

export const trackBarcodePaymentManualEntry = () => {
  void mixpanelTrack(
    "QRCODE_PAYMENT_MANUAL_ENTRY",
    buildEventProperties("UX", "action")
  );
};

export const trackBarcodeUploadPath = (flow: BarcodeAnalyticsFlow) => {
  void mixpanelTrack(
    "QRCODE_UPLOAD_PATH",
    buildEventProperties("UX", "action", { flow })
  );
};

export const trackBarcodeImageUpload = (flow: BarcodeAnalyticsFlow) => {
  void mixpanelTrack(
    "QRCODE_IMAGE_UPLOAD",
    buildEventProperties("UX", "action", { flow })
  );
};

export const trackBarcodeFileUpload = (flow: BarcodeAnalyticsFlow) => {
  void mixpanelTrack(
    "QRCODE_FILE_UPLOAD",
    buildEventProperties("UX", "action", { flow })
  );
};

/*

export const trackBarcodeDocumentManualEntry = () => {
  void mixpanelTrack(
    "QRCODE_DOCUMENT_MANUAL_ENTRY",
    buildEventProperties("UX", "action")
  );
};

export const trackBarcodeSignatureManualEntry = () => {
  void mixpanelTrack(
    "QRCODE_SIGNATURE_MANUAL_ENTRY",
    buildEventProperties("UX", "action")
  );
};
*/

export const testable = isTestEnv ? { getEventCodeFromBarcode } : undefined;
