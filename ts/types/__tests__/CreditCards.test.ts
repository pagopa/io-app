import { PortfolioAPI } from "../../api/portfolio/portfolio-api";
import { CreditCard } from "../portfolio/CreditCard";
import { CreditCardType } from "../portfolio/CreditCardType";

describe("Credit Cards", () => {
  const cards: ReadonlyArray<CreditCard> = PortfolioAPI.getCreditCards();

  test("Amex Number should be recognized", () => {
    expect(cards[0].ccNumber).toBe("3759 876543 02001");
  });

  test("Amex Type should be Amex", () => {
    const cardType = CreditCard.getCardType(cards[0].ccNumber);
    expect(cardType).toBe(CreditCardType.AMEX);
  });

  test("Visa Type should be Visa", () => {
    const cardType = CreditCard.getCardType(cards[1].ccNumber);
    expect(cardType).toBe(CreditCardType.VISA);
  });

  test("Mastercard Type should be Mastercard", () => {
    const cardType = CreditCard.getCardType(cards[2].ccNumber);
    expect(cardType).toBe(CreditCardType.MASTERCARD);
  });

  test("Switch should just work", () => {
    const creditCardType: CreditCardType = CreditCard.getCardType(
      cards[1].ccNumber
    );

    expect(creditCardType).toBe(CreditCardType.VISA);
  });
});
