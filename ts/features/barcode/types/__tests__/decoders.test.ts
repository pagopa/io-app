import * as O from "fp-ts/lib/Option";
import { decodeIOBarcode } from "../decoders";
import { IO_BARCODE_ALL_TYPES } from "../IOBarcode";
import { GlobalState } from "../../../../store/reducers/types";

const fakeGlobalState = {
  remoteConfig: O.some({
    pn: {
      aarQRCodeRegex:
        "^\\s*https:\\/\\/(cittadini|login)\\.(uat\\.)?notifichedigitali\\.it(\\/[^?]*)?\\?aar=[^\\s]+"
    }
  })
} as GlobalState;

describe("test decodeIOBarcode function", () => {
  it("should return unknown if empty value", () => {
    const value = "";
    const output = decodeIOBarcode(fakeGlobalState, value);

    expect(output).toStrictEqual(O.none);
  });

  describe("test IDPAY barcode type", () => {
    it("should return O.some on valid QRCode content", () => {
      const trxCode = "mkdb1yxg";
      const value = "https://continua.io.pagopa.it/idpay/auth/" + trxCode;
      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(
        O.some({ type: "IDPAY", authUrl: value, trxCode })
      );
    });
    it("should return O.none on invalid QR content", () => {
      const value = "https://continua.io.pagopa.it/idpay/auth/pippo";
      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(O.none);
    });
    it("should return O.none with valid content and IDPAY type not supported", () => {
      const value = "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg";
      const output = decodeIOBarcode(fakeGlobalState, value, {
        barcodeTypes: IO_BARCODE_ALL_TYPES.filter(t => t !== "IDPAY")
      });

      expect(output).toStrictEqual(O.none);
    });
  });

  describe("test PAGOPA QRCode barcode type", () => {
    it("should return PAGOPA on valid QRCode content", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158|0000015000";
      const output = O.toUndefined(decodeIOBarcode(fakeGlobalState, value));

      expect(output).toHaveProperty("type", "PAGOPA");
      expect(output).toHaveProperty("amount", "0000015000");
    });
    it("should return UNKNOWN on invalid QRCode content", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158";
      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(O.none);
    });
    it("should return O.none with valid content and PAGOPA type not supported", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158|0000015000";
      const output = decodeIOBarcode(fakeGlobalState, value, {
        barcodeTypes: IO_BARCODE_ALL_TYPES.filter(t => t !== "PAGOPA")
      });

      expect(output).toStrictEqual(O.none);
    });
  });

  describe("test PAGOPA DataMatrix barcode type", () => {
    it("should return PAGOPA on valid DataMatrix content", () => {
      const value =
        "codfase=NBPA;183007157000000000321200001630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";
      const output = O.toUndefined(decodeIOBarcode(fakeGlobalState, value));

      expect(output).toHaveProperty("type", "PAGOPA");
      expect(output).toHaveProperty("amount", "0000000001");
    });
    it("should return UNKNOWN on invalid DataMatrix content", () => {
      const value =
        "codfase=NBPA;1830071A7000000000321200E01630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";
      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(O.none);
    });
    it("should return O.none with valid content and PAGOPA type not supported", () => {
      const value =
        "codfase=NBPA;1830071A7000000000321200E01630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";
      const output = decodeIOBarcode(fakeGlobalState, value, {
        barcodeTypes: IO_BARCODE_ALL_TYPES.filter(t => t !== "PAGOPA")
      });

      expect(output).toStrictEqual(O.none);
    });
  });

  describe("test ITW_REMOTE barcode type", () => {
    it("should return O.some on valid QRCode content", () => {
      const value =
        "https://continua.io.pagopa.it/itw/auth?client_id=abc123xy&request_uri=https%3A%2F%2Fexample.com%2Fcallback&state=hyqizm592";

      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(
        O.some({
          type: "ITW_REMOTE",
          itwRemoteRequestPayload: {
            client_id: "abc123xy",
            request_uri: "https://example.com/callback",
            state: "hyqizm592",
            request_uri_method: "get"
          }
        })
      );
    });

    it("should decode request_uri_method if provided", () => {
      const value =
        "https://continua.io.pagopa.it/itw/auth?client_id=abc123xy&request_uri=https%3A%2F%2Fexample.com%2Fcallback&state=hyqizm592&request_uri_method=post";

      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(
        O.some({
          type: "ITW_REMOTE",
          itwRemoteRequestPayload: {
            client_id: "abc123xy",
            request_uri: "https://example.com/callback",
            state: "hyqizm592",
            request_uri_method: "post"
          }
        })
      );
    });

    it("should return O.none if request_uri is missing", () => {
      const value =
        "https://continua.io.pagopa.it/itw/auth?client_id=abc123xy&state=hyqizm592";

      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(O.none);
    });

    it("should return O.none if client_id is missing", () => {
      const value =
        "https://continua.io.pagopa.it/itw/auth?request_uri=https%3A%2F%2Fexample.com%2Fcallback&state=hyqizm592";

      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(O.none);
    });

    it("should return O.none if both client_id and request_uri are missing", () => {
      const value =
        "https://continua.io.pagopa.it/itw/auth?state=hyqizm592&request_uri_method=POST";

      const output = decodeIOBarcode(fakeGlobalState, value);

      expect(output).toStrictEqual(O.none);
    });
  });

  describe("test SEND AAR barcode type", () => {
    const testUrls: Array<[string, boolean]> = [
      // "CITTADINI" domain
      ["https://cittadini.uat.notifichedigitali.it/?aar=whatever", true],
      ["https://cittadini.notifichedigitali.it/?aar=whatever", true],
      [
        "https://cittadini.notifichedigitali.it/notifications/detail?aar=12345",
        true
      ],
      [
        "  https://cittadini.uat.notifichedigitali.it/some/path?aar=abc123  ",
        true
      ],
      ["https://cittadini.test.notifichedigitali.it/?aar=whatever", false],
      ["https://cittadini.hotfix.notifichedigitali.it/?aar=whatever", false],
      ["https://cittadini.dev.notifichedigitali.it/?aar=whatever", false],
      // "LOGIN" domain
      ["https://login.uat.notifichedigitali.it/?aar=whatever", true],
      [
        "https://login.notifichedigitali.it/notifications/detail?aar=12345",
        true
      ],
      ["  https://login.uat.notifichedigitali.it/some/path?aar=abc123  ", true],
      ["https://login.notifichedigitali.it/?aar=whatever", true],

      ["https://login.test.notifichedigitali.it/?aar=whatever", false],
      ["https://login.hotfix.notifichedigitali.it/?aar=whatever", false],
      ["https://login.dev.notifichedigitali.it/?aar=whatever", false],
      ["https://login.stage.notifichedigitali.it/?aar=whatever", false],
      // invalid cases

      ["https://cittadini.notifichedigitali.it/?aar=", false],
      ["https://cittadini.notifichedigitali.it/?aar= ", false],
      ["https://login.notifichedigitali.it/?aar=", false],
      ["https://login.notifichedigitali.it/?aar= ", false],
      ["https://other-domain.it/?aar=whatever", false],
      ["https://cittadini.state.notifichedigitali.it/?aar=whatever", false],
      // wrong subdomain placement
      ["https://dev.cittadini.notifichedigitali.it/?aar=whatever", false],
      ["https://test.cittadini.notifichedigitali.it/?aar=whatever", false],
      ["https://hotfix.cittadini.notifichedigitali.it/?aar=whatever", false],
      ["https://uat.cittadini.notifichedigitali.it/?aar=whatever", false],
      ["https://dev.login.notifichedigitali.it/?aar=whatever", false],
      ["https://test.login.notifichedigitali.it/?aar=whatever", false],
      ["https://hotfix.login.notifichedigitali.it/?aar=whatever", false],
      ["https://uat.login.notifichedigitali.it/?aar=whatever", false]
    ];
    testUrls.forEach(([data, shouldMatch]) => {
      it(`should ${
        shouldMatch ? "" : "not "
      }match a QRCode containing '${data}'`, () => {
        const output = decodeIOBarcode(fakeGlobalState, data);
        if (shouldMatch) {
          expect(output).toEqual(
            O.some({
              qrCodeContent: data.trim(),
              type: "SEND"
            })
          );
        } else {
          expect(output).toEqual(O.none);
        }
      });
    });
  });
});
