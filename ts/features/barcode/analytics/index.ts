import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

type BarcodeEventFlow = "home" | "avviso" | "idpay"; // Should be extended for every feature
type BarcodeEventCode = "avviso" | "data_matrix" | "idpay"; // Should be extended for every feature

export const trackBarcodeCameraAuthorization = () => {
  void mixpanelTrack(
    "QRCODE_CAMERA_AUTHORIZATION",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackBarcodeCameraAuthorizationBis = () => {
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

export const trackBarcodeCameraAuthorizedBis = () => {
  void mixpanelTrack(
    "QRCODE_CAMERA_AUTHORIZED_2",
    buildEventProperties("UX", "action")
  );
};

export const trackBarcodeScanScreen = (flow: BarcodeEventFlow) => {
  void mixpanelTrack(
    "QRCODE_SCAN_SCREEN",
    buildEventProperties("UX", "screen_view", { flow })
  );
};

export const trackBarcodeScanSuccess = (
  flow: BarcodeEventFlow,
  code: BarcodeEventCode,
  data_entry: "qr code" | "manual" | "file" | "message" | "deep link"
) => {
  void mixpanelTrack(
    "QRCODE_SCAN_SUCCESS",
    buildEventProperties("UX", "action", { flow, code, data_entry })
  );
};

export const trackBarcodeScanFailure = (
  flow: BarcodeEventFlow,
  reason: "qr code non valido" | "qr code flusso sbagliato"
) => {
  void mixpanelTrack(
    "QRCODE_SCAN_FAILURE",
    buildEventProperties("KO", undefined, { flow, reason })
  );
};

export const trackBarcodeScanTorch = () => {
  void mixpanelTrack("QRCODE_SCAN_TORCH", buildEventProperties("UX", "action"));
};

export const trackBarcodeNotFound = () => {
  void mixpanelTrack(
    "QRCODE_NO_CODE_FOUND",
    buildEventProperties("KO", undefined)
  );
};

export const trackBarcodeMultipleCodes = () => {
  void mixpanelTrack(
    "QRCODE_MULTIPLE_CODES",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackBarcodeMultipleCoudesSelection = () => {
  void mixpanelTrack(
    "QRCODE_MULTIPLE_CODES_SELECTION",
    buildEventProperties("UX", "action")
  );
};

export const trackBarcodeUploadPath = (flow: BarcodeEventFlow) => {
  void mixpanelTrack(
    "QRCODE_UPLOAD_PATH",
    buildEventProperties("UX", "action", { flow })
  );
};

export const trackBarcodeManualEntryPath = (flow: BarcodeEventFlow) => {
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

export const trackBarcodeImageUpload = (flow: BarcodeEventFlow) => {
  void mixpanelTrack(
    "QRCODE_IMAGE_UPLOAD",
    buildEventProperties("UX", "action", { flow })
  );
};

export const trackBarcodeFileUpload = (flow: BarcodeEventFlow) => {
  void mixpanelTrack(
    "QRCODE_FILE_UPLOAD",
    buildEventProperties("UX", "action", { flow })
  );
};
