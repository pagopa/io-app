import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";

import { Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import { pipe } from "fp-ts/lib/function";
import { PaymentAmount } from "../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../definitions/backend/PaymentNoticeNumber";
import I18n from "../../i18n";
import { Transaction } from "../../types/pagopa";
import {
  cleanTransactionDescription,
  decodePagoPaQrCode,
  decodePosteDataMatrix,
  DetailV2Keys,
  ErrorTypes,
  getAmountFromPaymentAmount,
  getCodiceAvviso,
  getErrorDescriptionV2,
  getRptIdFromNoticeNumber,
  getTransactionFee,
  getTransactionIUV,
  getV2ErrorMainType
} from "../payment";

describe("getAmountFromPaymentAmount", () => {
  const aPaymentAmount = 1 as PaymentAmount;
  it("should convert a valid PaymentAmount into an AmountInEuroCents", () => {
    const amountInEuroCents = pipe(
      getAmountFromPaymentAmount(aPaymentAmount),
      O.getOrElse(() => "💰" as AmountInEuroCents)
    );
    expect(amountInEuroCents).toEqual("01" as AmountInEuroCents);
  });
});

describe("getRptIdFromNoticeNumber", () => {
  const anOrganizationFiscalCode = "00000123456" as OrganizationFiscalCode;
  const aNoticeNumber = "002160020399398578" as PaymentNoticeNumber;
  const anRptId = {
    organizationFiscalCode: "00000123456",
    paymentNoticeNumber: {
      applicationCode: "02",
      auxDigit: "0",
      checkDigit: "78",
      iuv13: "1600203993985"
    }
  };
  it("should convert a PaymentNoticeNumber into an RptId", () => {
    const rptId = pipe(
      getRptIdFromNoticeNumber(anOrganizationFiscalCode, aNoticeNumber),
      O.getOrElseW(() => ({} as RptId))
    );
    expect(rptId).toEqual(anRptId);
  });
});

describe("cleanTransactionDescription", () => {
  it("should remove the tag returning just the description", () => {
    [
      [
        "/RFB/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "RFB/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "/RFA/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "RFA/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "RFS/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "/RFS/0123456789012/666.98/TXT/ actual description",
        "actual description"
      ],
      [
        "/RFS/0123456789012/666.98/TXT/ actual description/other text",
        "actual description/other text"
      ],
      [
        "/RFB/000001234556859/143.00",
        `${I18n.t("payment.IUV")} 000001234556859`
      ],
      ["/XYZ/TXT/some text", "some text"],
      ["/TXT/some text", "some text"],
      ["TXT/some text", "some text"],
      ["/TXT/some text/other text", "some text/other text"],
      ["TXT/some text/other text", "some text/other text"],
      ["actual description", "actual description"]
    ].forEach(([dirty, cleaned]) => {
      expect(cleanTransactionDescription(dirty)).toEqual(cleaned);
    });
  });
});

describe("decodePagoPaQrCode", () => {
  it("should decode a string encoded into a pagoPa QRcode", () => {
    [
      Tuple2(
        "PAGOPA|002|322201151398574181|81005750021|01",
        O.some(
          Tuple2(
            {
              organizationFiscalCode: "81005750021",
              paymentNoticeNumber: {
                auxDigit: "3",
                checkDigit: "81",
                iuv13: "2011513985741",
                segregationCode: "22"
              }
            },
            "01"
          )
        )
      ),
      // not supported version
      Tuple2("PAGOPA|003|322201151398574181|810057500211|01A", O.none),
      // invalid amount
      Tuple2("PAGOPA|002|322201151398574181|810057500211|01A", O.none),
      // invalid header
      Tuple2("PAPAGO|002|322201151398574181|810057500211|01", O.none),
      // this is valid
      Tuple2(
        "PAGOPA|002|322201151398574181|81005750021|1",
        O.some(
          Tuple2(
            {
              organizationFiscalCode: "81005750021",
              paymentNoticeNumber: {
                auxDigit: "3",
                checkDigit: "81",
                iuv13: "2011513985741",
                segregationCode: "22"
              }
            },
            "1"
          )
        )
      ),
      // invalid organization fiscal code (12 digit instead of 11)
      Tuple2("PAGOPA|002|322201151398574181|810057500211|01", O.none)
    ].forEach(tuple => {
      expect(decodePagoPaQrCode(tuple.e1)).toEqual(tuple.e2);
    });
  });
});

describe("decodePosteDataMatrix", () => {
  it("should decode successfully a valid string", () => {
    const input =
      "codfase=NBPA;183007157000000000321200001630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";

    const output = decodePosteDataMatrix(input);

    expect(O.isSome(output)).toBe(true);
  });

  it("should not decode an invalid string", () => {
    const input =
      "codfase=NBPA;1830071A7000000000321200E01630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";

    const output = decodePosteDataMatrix(input);

    expect(O.isSome(output)).toBe(false);
  });

  it("should not decode a string encoded differently", () => {
    const input = "PAGOPA|002|322201151398574181|810057500211|01";
    const output = decodePosteDataMatrix(input);

    expect(O.isSome(output)).toBe(false);
  });

  it("should not decode an empty string", () => {
    const input = "";
    const output = decodePosteDataMatrix(input);

    expect(O.isSome(output)).toBe(false);
  });
});

const mockTranction: Transaction = {
  accountingStatus: 1,
  amount: { amount: 20000 },
  created: new Date(2018, 10, 30, 13, 12, 22, 30),
  description: `hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world hello world`,
  error: false,
  fee: { amount: 123 },
  grandTotal: { amount: 32100 },
  id: 1,
  idPayment: 1,
  idPsp: 43188,
  idStatus: 3,
  idWallet: 12345,
  merchant: "merchant",
  nodoIdPayment: "nodoIdPayment",
  paymentModel: 5,
  spcNodeDescription: "spcNodeDescription",
  spcNodeStatus: 6,
  statusMessage: "statusMessage",
  success: true,
  token: "token",
  updated: undefined,
  urlCheckout3ds: "urlCheckout3ds",
  urlRedirectPSP: "urlRedirectPSP"
};

describe("getTransactionFee", () => {
  [
    Tuple2(mockTranction, `${123}`),
    Tuple2({ ...mockTranction, fee: undefined }, null),
    Tuple2({ ...mockTranction, fee: { amount: 54321 } }, `${54321}`),
    Tuple2({ ...mockTranction, fee: { amount: 0 } }, `${0}`)
  ].forEach(tuple => {
    expect(getTransactionFee(tuple.e1, f => `${f}`)).toEqual(tuple.e2);
  });
});

describe("getTransactionIUV", () => {
  [
    Tuple2(
      "/RFB/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      O.some("02000000000495213")
    ),
    Tuple2(
      "RFB/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      O.some("02000000000495213")
    ),
    Tuple2(
      "/RFA/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      O.some("02000000000495213")
    ),
    Tuple2(
      "RFA/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      O.some("02000000000495213")
    ),
    Tuple2(
      "/RFS/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      O.some("02000000000495213")
    ),
    Tuple2(
      "RFS/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION",
      O.some("02000000000495213")
    ),
    Tuple2("", O.none),
    Tuple2("RFC/02000000000495213/0.01/TXT/TRANSACTION DESCRIPTION", O.none),
    Tuple2("RFB/", O.none)
  ].forEach(tuple => {
    expect(getTransactionIUV(tuple.e1)).toEqual(tuple.e2);
  });
});

describe("getCodiceAvviso", () => {
  const organizationFiscalCode = "00000123456";
  [
    Tuple2<RptId, string>(
      {
        organizationFiscalCode,
        paymentNoticeNumber: {
          applicationCode: "02",
          auxDigit: "0",
          checkDigit: "78",
          iuv13: "1600203993985"
        }
      } as RptId,
      `002160020399398578`
    ),
    Tuple2<RptId, string>(
      {
        organizationFiscalCode,
        paymentNoticeNumber: {
          auxDigit: "1",
          iuv17: "16002039939851111"
        }
      } as RptId,
      `116002039939851111`
    ),
    Tuple2<RptId, string>(
      {
        organizationFiscalCode,
        paymentNoticeNumber: {
          checkDigit: "78",
          auxDigit: "2",
          iuv15: "160020399398511"
        }
      } as RptId,
      `216002039939851178`
    ),
    Tuple2<RptId, string>(
      {
        organizationFiscalCode,
        paymentNoticeNumber: {
          checkDigit: "78",
          auxDigit: "3",
          segregationCode: "55",
          iuv13: "1600203993985"
        }
      } as RptId,
      `355160020399398578`
    )
  ].forEach(tuple => {
    expect(getCodiceAvviso(tuple.e1)).toEqual(tuple.e2);
  });
});

describe("getV2ErrorMacro", () => {
  it("Should return correct macro error type given a specific error code", () => {
    [
      Tuple2<DetailV2Keys, ErrorTypes>("PPT_CANALE_DISABILITATO", "TECHNICAL"),
      Tuple2<DetailV2Keys, ErrorTypes>("PPT_SINTASSI_EXTRAXSD", "DATA"),
      Tuple2<DetailV2Keys, ErrorTypes>("PPT_STAZIONE_INT_PA_TIMEOUT", "EC"),
      Tuple2<DetailV2Keys, ErrorTypes>("PPT_ERRORE_EMESSO_DA_PAA", "EC"),
      Tuple2<DetailV2Keys, ErrorTypes>("PAA_PAGAMENTO_IN_CORSO", "ONGOING"),
      Tuple2<DetailV2Keys, ErrorTypes>("PPT_PAGAMENTO_IN_CORSO", "ONGOING"),
      Tuple2<DetailV2Keys, ErrorTypes>("PAA_PAGAMENTO_ANNULLATO", "REVOKED"),
      Tuple2<DetailV2Keys, ErrorTypes>("PAA_PAGAMENTO_SCADUTO", "EXPIRED"),
      Tuple2<DetailV2Keys, ErrorTypes>("PAA_PAGAMENTO_DUPLICATO", "DUPLICATED"),
      Tuple2<DetailV2Keys, ErrorTypes>("PPT_PAGAMENTO_DUPLICATO", "DUPLICATED"),
      Tuple2<DetailV2Keys, ErrorTypes>(
        "PAA_PAGAMENTO_SCONOSCIUTO",
        "NOT_FOUND"
      ),
      Tuple2<DetailV2Keys, ErrorTypes>("PPT_RT_SCONOSCIUTA", "UNCOVERED")
    ].forEach(t => {
      expect(getV2ErrorMainType(t.e1)).toBe(t.e2);
    });
  });
});

describe("getErrorDescriptionV2", () => {
  it("Should return correct error description given a specific error code", () => {
    [
      Tuple2<DetailV2Keys | undefined, string>(
        "PPT_CANALE_DISABILITATO",
        I18n.t("wallet.errors.TECHNICAL")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PPT_SINTASSI_EXTRAXSD",
        I18n.t("wallet.errors.DATA")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PPT_STAZIONE_INT_PA_TIMEOUT",
        I18n.t("wallet.errors.EC")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PPT_ERRORE_EMESSO_DA_PAA",
        I18n.t("wallet.errors.EC")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PAA_PAGAMENTO_IN_CORSO",
        I18n.t("wallet.errors.ONGOING")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PPT_PAGAMENTO_IN_CORSO",
        I18n.t("wallet.errors.ONGOING")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PAA_PAGAMENTO_ANNULLATO",
        I18n.t("wallet.errors.REVOKED")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PAA_PAGAMENTO_SCADUTO",
        I18n.t("wallet.errors.EXPIRED")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PAA_PAGAMENTO_DUPLICATO",
        I18n.t("wallet.errors.DUPLICATED")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PPT_PAGAMENTO_DUPLICATO",
        I18n.t("wallet.errors.DUPLICATED")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PAA_PAGAMENTO_SCONOSCIUTO",
        I18n.t("wallet.errors.NOT_FOUND")
      ),
      Tuple2<DetailV2Keys | undefined, string>(
        "PPT_RT_SCONOSCIUTA",
        I18n.t("wallet.errors.GENERIC_ERROR")
      ),
      Tuple2<DetailV2Keys | undefined, undefined>(undefined, undefined)
    ].forEach(t => {
      expect(getErrorDescriptionV2(t.e1)).toBe(t.e2);
    });
  });
});
