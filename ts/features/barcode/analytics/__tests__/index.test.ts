import { testable, trackBarcodeScanSuccess } from "..";
import * as mixpanel from "../../../../mixpanel";
import { IOBarcode } from "../../types/IOBarcode";

describe("index", () => {
  describe("getEventCodeFromBarcode", () => {
    it("should return 'idpay' for barcode of type 'IDPAY' and format 'DATA_MATRIX'", () => {
      const idPayIOBarcode = {
        type: "IDPAY",
        format: "DATA_MATRIX"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("idpay");
    });
    it("should return 'idpay' for barcode of type 'IDPAY' and format 'QR_CODE'", () => {
      const idPayIOBarcode = {
        type: "IDPAY",
        format: "QR_CODE"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("idpay");
    });
    it("should return 'data_matrix' for barcode of type 'PAGOPA' and format 'DATA_MATRIX'", () => {
      const idPayIOBarcode = {
        type: "PAGOPA",
        format: "DATA_MATRIX"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("data_matrix");
    });
    it("should return 'avviso' for barcode of type 'PAGOPA' and format 'QR_CODE'", () => {
      const idPayIOBarcode = {
        type: "PAGOPA",
        format: "QR_CODE"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("avviso");
    });
    it("should return 'SEND' for barcode of type 'SEND' and format 'DATA_MATRIX'", () => {
      const idPayIOBarcode = {
        type: "SEND",
        format: "DATA_MATRIX"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("SEND");
    });
    it("should return 'SEND' for barcode of type 'SEND' and format 'QR_CODE'", () => {
      const idPayIOBarcode = {
        type: "SEND",
        format: "QR_CODE"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("SEND");
    });
    it("should return undefined for barcode of type 'FCI' and format 'DATA_MATRIX'", () => {
      const idPayIOBarcode = {
        type: "FCI",
        format: "DATA_MATRIX"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBeUndefined();
    });
    it("should return undefined for barcode of type 'FCI' and format 'QR_CODE'", () => {
      const idPayIOBarcode = {
        type: "FCI",
        format: "QR_CODE"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBeUndefined();
    });
    it("should return ITW presentazione remota for barcode of type 'ITW_REMOTE' and format 'DATA_MATRIX'", () => {
      const idPayIOBarcode = {
        type: "ITW_REMOTE",
        format: "DATA_MATRIX"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("ITW presentazione remota");
    });
    it("should return ITW presentazione remota for barcode of type 'ITW_REMOTE' and format 'QR_CODE'", () => {
      const idPayIOBarcode = {
        type: "ITW_REMOTE",
        format: "QR_CODE"
      } as IOBarcode;
      const code = testable!.getEventCodeFromBarcode(idPayIOBarcode);
      expect(code).toBe("ITW presentazione remota");
    });
  });
  describe("trackBarcodeScanSuccess", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    (["home", "avviso", "idpay"] as const).forEach(flow =>
      (["camera", "file"] as const).forEach(origin =>
        (["PAGOPA", "IDPAY", "FCI", "ITW_REMOTE", "SEND"] as const).forEach(
          barcodeType =>
            (["DATA_MATRIX", "QR_CODE"] as const).forEach(format =>
              it(`should call 'mixpanelTrack' with proper parameters on '${flow}' flow starting from '${origin}' for '${barcodeType}' barcode with '${format}' format`, () => {
                const ioBarcode = {
                  type: barcodeType,
                  format
                } as IOBarcode;

                const spiedOnMockedMixpanelTrack = jest
                  .spyOn(mixpanel, "mixpanelTrack")
                  .mockImplementation();

                trackBarcodeScanSuccess(flow, ioBarcode, origin);

                expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
                expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
                expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
                  "QRCODE_SCAN_SUCCESS"
                );
                expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
                  event_category: "UX",
                  event_type: "action",
                  flow,
                  code: codeFromTypeAndFormat(barcodeType, format),
                  data_entry: dataEntryFromOrigin(origin)
                });
              })
            )
        )
      )
    );
  });
});

const codeFromTypeAndFormat = (barcodeType: string, format: string) => {
  switch (barcodeType) {
    case "IDPAY":
      return "idpay";
    case "SEND":
      return "SEND";
    case "PAGOPA":
      if (format === "DATA_MATRIX") {
        return "data_matrix";
      } else {
        return "avviso";
      }
    case "ITW_REMOTE":
      return "ITW presentazione remota";
    default:
      return undefined;
  }
};

const dataEntryFromOrigin = (origin: string) =>
  origin === "camera" ? "qr code" : origin === "file" ? "file" : undefined;
