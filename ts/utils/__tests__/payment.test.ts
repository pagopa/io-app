import * as O from "fp-ts/lib/Option";
import { Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import I18n from "i18next";
import {
  cleanTransactionDescription,
  decodePosteDataMatrix,
  DetailV2Keys,
  ErrorTypes,
  getTransactionIUV,
  getV2ErrorMainType
} from "../payment";

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

describe("getV2ErrorMacro", () => {
  it("Should return correct macro error type given a specific error code", () => {
    [
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
