import { EnableableFunctionsEnum } from "../../../definitions/pagopa/EnableableFunctions";
import { CreditCardPaymentMethod, PaymentMethod } from "../../types/pagopa";
import {
  hasPaymentFeature,
  isDisabledToPay,
  isEnabledToPay
} from "../paymentMethodCapabilities";

const aCreditCard = {
  kind: "CreditCard",
  info: {
    brand: "VISA"
  }
} as CreditCardPaymentMethod;
const paymentMethod = {
  ...aCreditCard,
  enableableFunctions: [],
  pagoPA: true
} as PaymentMethod;

const testCases: ReadonlyArray<
  [
    {
      expected: {
        hasPaymentFeatureEnabled: boolean;
        isDisabledToPay: boolean;
        isEnabledToPay: boolean;
      };
      pm: PaymentMethod;
    }
  ]
> = [
  [
    {
      pm: {
        ...paymentMethod,
        enableableFunctions: [],
        pagoPA: true
      },
      expected: {
        hasPaymentFeatureEnabled: false,
        isEnabledToPay: false,
        isDisabledToPay: false
      }
    }
  ],
  [
    {
      pm: {
        ...paymentMethod,
        enableableFunctions: [EnableableFunctionsEnum.pagoPA],
        pagoPA: false
      },
      expected: {
        hasPaymentFeatureEnabled: true,
        isEnabledToPay: false,
        isDisabledToPay: true
      }
    }
  ],
  [
    {
      pm: {
        ...paymentMethod,
        enableableFunctions: [EnableableFunctionsEnum.pagoPA],
        pagoPA: true
      },
      expected: {
        hasPaymentFeatureEnabled: true,
        isEnabledToPay: true,
        isDisabledToPay: false
      }
    }
  ],
  [
    {
      pm: {
        ...paymentMethod,
        enableableFunctions: [],
        pagoPA: true
      },
      expected: {
        hasPaymentFeatureEnabled: false,
        isEnabledToPay: false,
        isDisabledToPay: false
      }
    }
  ]
];
test.each(testCases)(
  `given payment method with pagoPa=%j as argument, expect these results %s`,
  ({ pm, expected }) => {
    expect(hasPaymentFeature(pm)).toEqual(expected.hasPaymentFeatureEnabled);

    expect(isEnabledToPay(pm)).toEqual(expected.isEnabledToPay);

    expect(isDisabledToPay(pm)).toEqual(expected.isDisabledToPay);
  }
);
