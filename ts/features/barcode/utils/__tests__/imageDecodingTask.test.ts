import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";

jest.mock("./../barcodeDetectionTask", () => ({
  barcodeDetectionTask: jest.fn()
}));

import { QRCodeScanResult } from "rn-qr-generator";
import { BarcodeFailure } from "../../types/failure";
import { imageDecodingTask } from "../imageDecodingTask";
import { barcodeDetectionTask } from "../barcodeDetectionTask";
import { GlobalState } from "../../../../store/reducers/types";

const mockGlobalState = {
  remoteConfig: O.some({
    pn: {
      aarQRCodeRegex:
        "^\\s*https:\\/\\/(cittadini|login)\\.(uat\\.)?notifichedigitali\\.it(\\/[^?]*)?\\?aar=[^\\s]+"
    }
  })
} as GlobalState;

describe("imageDecodingTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("should return UNEXPECTED error if detection fails", async () => {
    (barcodeDetectionTask as jest.Mock).mockImplementation(
      (): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
        TE.left({ reason: "UNEXPECTED" })
    );
    const result = await imageDecodingTask(mockGlobalState, { uri: "test" })();
    expect(result).toEqual(E.left({ reason: "UNEXPECTED" }));
  });

  it("should return BARCODE_NOT_FOUND error if no barcode was found", async () => {
    (barcodeDetectionTask as jest.Mock).mockImplementation(
      (): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
        TE.right({ type: "QRCode", values: [] })
    );
    const result = await imageDecodingTask(mockGlobalState, { uri: "test" })();
    expect(result).toEqual(E.left({ reason: "BARCODE_NOT_FOUND" }));
  });

  it("should return UNSUPPORTED_FORMAT error if format is not supported", async () => {
    (barcodeDetectionTask as jest.Mock).mockImplementation(
      (): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
        TE.right({ type: "PDF417", values: ["Hello!"] })
    );
    const result = await imageDecodingTask(mockGlobalState, { uri: "test" })();
    expect(result).toEqual(E.left({ reason: "UNSUPPORTED_FORMAT" }));
  });

  it("should return UNSUPPORTED_FORMAT error if format is not supported (with filter)", async () => {
    (barcodeDetectionTask as jest.Mock).mockImplementation(
      (): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
        TE.right({ type: "DataMatrix", values: ["Hello!"] })
    );
    const result = await imageDecodingTask(mockGlobalState, { uri: "test" }, [
      "QR_CODE"
    ])();
    expect(result).toEqual(E.left({ reason: "UNSUPPORTED_FORMAT" }));
  });

  it("should return UNKNOWN_CONTENT error if content is not decodable", async () => {
    (barcodeDetectionTask as jest.Mock).mockImplementation(
      (): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
        TE.right({ type: "QRCode", values: ["Hello!"] })
    );
    const result = await imageDecodingTask(mockGlobalState, { uri: "test" })();
    expect(result).toEqual(
      E.left({
        reason: "UNKNOWN_CONTENT",
        content: "Hello!",
        format: "QR_CODE"
      })
    );
  });

  it("should return only the valid decoded barcodes", async () => {
    (barcodeDetectionTask as jest.Mock).mockImplementation(
      (): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
        TE.right({
          type: "QRCode",
          values: [
            "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg",
            "https://continua.io.pagopa.it/idpay/auth/12345678",
            "Hello!"
          ]
        })
    );
    const result = await imageDecodingTask(mockGlobalState, { uri: "test" })();
    expect(result).toEqual(
      E.right([
        {
          type: "IDPAY",
          format: "QR_CODE",
          authUrl: "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg",
          trxCode: "mkdb1yxg"
        },
        {
          type: "IDPAY",
          format: "QR_CODE",
          authUrl: "https://continua.io.pagopa.it/idpay/auth/12345678",
          trxCode: "12345678"
        }
      ])
    );
  });

  it("should return unique barcodes", async () => {
    (barcodeDetectionTask as jest.Mock).mockImplementation(
      (): TE.TaskEither<BarcodeFailure, QRCodeScanResult> =>
        TE.right({
          type: "QRCode",
          values: [
            "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg",
            "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg",
            "Hello!"
          ]
        })
    );
    const result = await imageDecodingTask(mockGlobalState, { uri: "test" })();
    expect(result).toEqual(
      E.right([
        {
          type: "IDPAY",
          format: "QR_CODE",
          authUrl: "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg",
          trxCode: "mkdb1yxg"
        }
      ])
    );
  });
});
