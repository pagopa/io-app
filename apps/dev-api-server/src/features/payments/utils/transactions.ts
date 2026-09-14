import { fakerIT as faker } from "@faker-js/faker";
import { CartItem } from "@io-app/api-types/generated/definitions/pagopa/biz-events/CartItem";
import {
  InfoNotice,
  OriginEnum,
  PaymentMethodEnum
} from "@io-app/api-types/generated/definitions/pagopa/biz-events/InfoNotice";
import { ulid } from "ulid";

const PAYMENT_METHODS_TRANSACTIONS_MOCK = [
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/visa.png",
    brand: "VISA",
    name: "Visa"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
    brand: "MASTERCARD",
    name: "Mastercard"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/amex.png",
    brand: "AMEX",
    name: "Amex"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/creditcard/maestro.png",
    brand: "MAESTRO",
    name: "Maestro"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/apm/paypal.png",
    brand: "PAYPAL",
    name: "PayPal"
  },
  {
    logo: "https://assets.cdn.platform.pagopa.it/apm/mybank.png",
    brand: "MYBANK",
    name: "MyBank"
  }
];

export const generateRandomInfoNotice = (
  cartList: Array<CartItem>,
  eventId?: string
): InfoNotice => {
  const randomPaymentMethod = faker.helpers.arrayElement(
    PAYMENT_METHODS_TRANSACTIONS_MOCK
  );
  return {
    eventId: eventId ?? ulid(),
    authCode: faker.string.alphanumeric(6),
    rrn: faker.string.numeric(12),
    noticeDate: new Date().toISOString(),
    pspName: "Intesa Sanpaolo",
    walletInfo: {
      accountHolder: faker.person.fullName(),
      brand:
        randomPaymentMethod.brand !== "PAYPAL"
          ? randomPaymentMethod.brand
          : undefined,
      blurredNumber:
        randomPaymentMethod.brand !== "PAYPAL"
          ? faker.finance.creditCardNumber().slice(-4)
          : undefined,
      maskedEmail:
        randomPaymentMethod.brand === "PAYPAL"
          ? faker.internet.email()
          : undefined
    },
    paymentMethod: PaymentMethodEnum.PPAL,
    payer: {
      name: faker.person.fullName(),
      taxCode: faker.string.alphanumeric(16).toLocaleUpperCase()
    },
    amount: cartList
      .reduce((acc, item) => acc + Number(item.amount), 0)
      .toString(),
    fee: faker.finance.amount({ min: 0, max: 10 }),
    origin: OriginEnum.INTERNAL
  };
};
