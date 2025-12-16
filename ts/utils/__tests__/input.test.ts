import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardHolder,
  CreditCardPan,
  CreditCardState,
  getCreditCardFromState,
  isValidCardHolder,
  isValidPan,
  isValidSecurityCode
} from "../input";

describe("CreditCardHolder", () => {
  const validHolders: ReadonlyArray<string> = [
    "VALID -",
    "VALID !",
    "Val1d H0lder",
    "Valid holder",
    "Valid @",
    "@ [ \\ ] ^ _ ' { | } - . , + * ( ) & % # \" ! : ; <> = ?"
  ];

  it("should accept valid holders", () => {
    validHolders.forEach(h => expect(CreditCardHolder.is(h)).toBeTruthy());
  });

  const invalidHolders: ReadonlyArray<string> = [
    "VALID ~",
    "invalid ’",
    "! \" # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _ ` { | }",
    ""
  ];

  it("should NOT accept valid holders", () => {
    invalidHolders.forEach(h => {
      expect(CreditCardHolder.is(h)).toBeFalsy();
    });
  });
});

describe("CreditCardPan", () => {
  const validPANs: ReadonlyArray<string> = [
    "12341234123412",
    "123412341234123",
    "1234123412341234",
    "************1234",
    "12341234123412341",
    "123412341234123412",
    "1234123412341234123"
  ];

  it("should accept valid PANs", () => {
    validPANs.forEach(d => expect(CreditCardPan.is(d)).toBeTruthy());
  });

  it("should accept valid PANs, round 2", () => {
    validPANs.forEach(d => expect(isValidPan(O.some(d))).toBeTruthy());
  });

  const invalidPANs: ReadonlyArray<string> = [
    "1234 1234 1234 1234",
    "123412341234123_123",
    "1234123412",
    "12341234123412341234"
  ];

  it("should reject invalid PANs", () => {
    invalidPANs.forEach(d => expect(CreditCardPan.is(d)).toBeFalsy());
  });

  it("should reject invalid PANs, round 2", () => {
    invalidPANs.forEach(d => expect(isValidPan(O.some(d))).toBeFalsy());
  });

  it("should be undefined", () => {
    expect(isValidPan(O.none)).not.toBeDefined();
  });
});

describe("CreditCardExpirationMonth", () => {
  it("should accept valid months", () => {
    const data: ReadonlyArray<any> = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ];
    data.forEach(d => expect(CreditCardExpirationMonth.is(d)).toBeTruthy());
  });

  it("should reject invalid months", () => {
    const data: ReadonlyArray<any> = [
      "0",
      "00",
      "13",
      "1",
      "123",
      "!1",
      "1!",
      "001",
      "010"
    ];
    data.forEach(d => expect(CreditCardExpirationMonth.is(d)).toBeFalsy());
  });
});

describe("CreditCardExpirationYear", () => {
  it("should accept valid years", () => {
    const data: ReadonlyArray<any> = ["17", "18", "29", "52", "99"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeTruthy());
  });

  it("should reject invalid years", () => {
    const data: ReadonlyArray<any> = ["170", "1", "*9", "5*"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeFalsy());
  });
});

describe("CreditCardCVC", () => {
  const validCVCs: ReadonlyArray<string> = ["000", "1234"];

  it("should accept valid CVCs", () => {
    validCVCs.forEach(d => expect(CreditCardCVC.is(d)).toBeTruthy());
  });

  it("should accept valid CVCs, round 2", () => {
    validCVCs.forEach(d =>
      expect(isValidSecurityCode(O.fromNullable(d))).toBeTruthy()
    );
  });

  const invalidCVCs: ReadonlyArray<string> = ["00", "12345", "01*", "123*"];

  it("should reject invalid CVCs", () => {
    invalidCVCs.forEach(d => expect(CreditCardCVC.is(d)).toBeFalsy());
  });

  it("should reject invalid CVCs, round 2", () => {
    invalidCVCs.forEach(d =>
      expect(isValidSecurityCode(O.some(d))).toBeFalsy()
    );
  });
});

describe("isValidCardHolder", () => {
  [
    "á",
    "à",
    "ã",
    "â",
    "é",
    "è",
    "ê",
    "í",
    "ì",
    "î",
    "õ",
    "ó",
    "ò",
    "ô",
    "ú",
    "ù",
    "û",
    "  "
  ].forEach(accentedCardHolder =>
    it(`should return false if the input string contains the accented character ${accentedCardHolder}`, () => {
      expect(isValidCardHolder(O.some(accentedCardHolder))).toBeFalsy();
    })
  );

  it("should return false if the input string is none", () => {
    expect(isValidCardHolder(O.none)).toBeFalsy();
  });

  [
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789"
  ].forEach(notAccentedCardHolder =>
    it(`should return true if the input string is composed by character different from accented character: ${notAccentedCardHolder}`, () => {
      expect(isValidCardHolder(O.some(notAccentedCardHolder))).toBeTruthy();
    })
  );
});

describe("getCreditCardFromState", () => {
  const aValidCardHolder = "Mario Rossi";
  const anInvalidCardHolder = "Mariò Rossi";
  const aValidPan = "1234567891234568";
  const anInvalidPan = "1234 5678 9123";
  const aValidExpirationDate = "12/99";
  const anInvalidExpirationDate = "99/9";
  const aValidSecurityCode = "123";
  const anInvalidSecurityCode = "1";

  it.each`
    pan                     | expirationDate                     | securityCode                     | holder
    ${O.none}               | ${O.some(aValidExpirationDate)}    | ${O.some(aValidSecurityCode)}    | ${O.some(aValidCardHolder)}
    ${O.some(aValidPan)}    | ${O.none}                          | ${O.some(aValidSecurityCode)}    | ${O.some(aValidCardHolder)}
    ${O.some(aValidPan)}    | ${O.some(aValidExpirationDate)}    | ${O.none}                        | ${O.some(aValidCardHolder)}
    ${O.some(aValidPan)}    | ${O.some(aValidExpirationDate)}    | ${O.some(aValidSecurityCode)}    | ${O.none}
    ${O.some(anInvalidPan)} | ${O.some(aValidExpirationDate)}    | ${O.some(aValidSecurityCode)}    | ${O.some(aValidCardHolder)}
    ${O.some(aValidPan)}    | ${O.some(anInvalidExpirationDate)} | ${O.some(aValidSecurityCode)}    | ${O.some(aValidCardHolder)}
    ${O.some(aValidPan)}    | ${O.some(aValidExpirationDate)}    | ${O.some(anInvalidSecurityCode)} | ${O.some(aValidCardHolder)}
    ${O.some(aValidPan)}    | ${O.some(aValidExpirationDate)}    | ${O.some(aValidSecurityCode)}    | ${O.some(anInvalidCardHolder)}
  `(
    "should return left<string> if at least one field of the credit card is none or is invalid",
    async ({ pan, expirationDate, securityCode, holder }) => {
      const cardState: CreditCardState = {
        pan,
        expirationDate,
        securityCode,
        holder
      };
      const getCreditCardFromStateResult = getCreditCardFromState(cardState);
      expect(E.isLeft(getCreditCardFromStateResult)).toBeTruthy();
      if (E.isLeft(getCreditCardFromStateResult)) {
        expect(
          typeof getCreditCardFromStateResult.left === "string"
        ).toBeTruthy();
      }
    }
  );

  it("should return a credit card if all the field are correctly filled ", () => {
    const cardState: CreditCardState = {
      pan: O.some(aValidPan),
      expirationDate: O.some(aValidExpirationDate),
      securityCode: O.some(aValidSecurityCode),
      holder: O.some(aValidCardHolder)
    };

    if (O.isSome(cardState.expirationDate)) {
      const [expireMonth, expireYear] =
        cardState.expirationDate.value.split("/");

      const expectedCreditCard = {
        pan: aValidPan,
        expireMonth,
        expireYear,
        securityCode: aValidSecurityCode,
        holder: aValidCardHolder
      };
      expect(getCreditCardFromState(cardState)).toStrictEqual(
        E.right(expectedCreditCard)
      );
    }
  });
});
