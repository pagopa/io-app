import { PortfolioAPI } from "../../api/portfolio/portfolio-api";
import { CreditCard } from "../portfolio/CreditCard";
import { CreditCardType } from "../portfolio/CreditCardType";

describe("Credit Cards", () => {
  const cards: ReadonlyArray<CreditCard> = PortfolioAPI.getCreditCards();

  test("Amex Number should be recognized", () => {
    expect(cards[0].number).toBe("3759 876543 02001");
  });

  test("Amex Type should be Amex", () => {
    const cardType = CreditCard.getCardType(cards[0].number);
    expect(cardType).toBe(CreditCardType.AMEX);
  });

  test("Visa Type should be Visa", () => {
    const cardType = CreditCard.getCardType(cards[1].number);
    expect(cardType).toBe(CreditCardType.VISA);
  });

  test("Mastercard Type should be Mastercard", () => {
    const cardType = CreditCard.getCardType(cards[2].number);
    expect(cardType).toBe(CreditCardType.MASTERCARD);
  });

  test("Switch should just work", () => {
    const creditCardType: CreditCardType = CreditCard.getCardType(
      cards[1].number
    );

    const type = "?";

    switch (creditCardType) {
      case CreditCardType.VISA:
        type = "xVisa";
        break;
      case CreditCardType.MASTERCARD:
        type = "x";
        break;
      case CreditCardType.DINERS:
        type = "x";
        break;
      case CreditCardType.AMEX:
        type = "x";
        break;
      case CreditCardType.MAESTRO:
        type = "x";
        break;
      case CreditCardType.VISAELECTRON:
        type = "x";
        break;
      default:
        type = "default";
        break;
    }

    expect(type).toBe("xVisa");
  });
});
