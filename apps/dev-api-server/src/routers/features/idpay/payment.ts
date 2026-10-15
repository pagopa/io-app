import { fakerIT as faker } from "@faker-js/faker";
import {
  AuthPaymentResponseDTO,
  StatusEnum as PaymentStatusEnum
} from "@io-app/api-types/generated/definitions/idpay/AuthPaymentResponseDTO";
import {
  CodeEnum,
  TransactionErrorDTO
} from "@io-app/api-types/generated/definitions/idpay/TransactionErrorDTO";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";

import { getRandomEnumValue } from "../../../payloads/utils/random";
import { initiatives } from "../../../persistence/idpay";
import { addIdPayHandler } from "./router";

const generateRandomAuthPaymentResponseDTO = (): AuthPaymentResponseDTO => {
  const amount = faker.number.int({
    min: 10000,
    max: 1000000
  });

  return {
    id: ulid(),
    initiativeId: Object.values(initiatives)[0]?.initiativeId ?? ulid(),
    status: getRandomEnumValue(PaymentStatusEnum),
    trxCode: faker.string.sample(),
    rewardCents: amount,
    amountCents: amount,
    businessName: faker.commerce.productName(),
    initiativeName: faker.company.name(),
    trxDate: faker.date.recent(),
    residualBudgetCents: faker.number.int({
      min: 1000,
      max: 20000
    })
  } as AuthPaymentResponseDTO;
};

const generateRandomTransactionError = (
  code: CodeEnum
): TransactionErrorDTO => ({
  code,
  message: faker.lorem.sentence()
});

const codeToFailure: {
  [key: number]: { code: CodeEnum; status: number };
} = {
  1: { status: 404, code: CodeEnum.PAYMENT_NOT_FOUND_OR_EXPIRED },
  2: { status: 403, code: CodeEnum.PAYMENT_USER_NOT_ASSOCIATED },
  3: { status: 400, code: CodeEnum.PAYMENT_NOT_FOUND_OR_EXPIRED },
  4: { status: 403, code: CodeEnum.PAYMENT_BUDGET_EXHAUSTED },
  5: { status: 403, code: CodeEnum.PAYMENT_GENERIC_REJECTED },
  6: { status: 429, code: CodeEnum.PAYMENT_TOO_MANY_REQUESTS },
  7: { status: 500, code: CodeEnum.PAYMENT_GENERIC_ERROR },
  8: { status: 403, code: CodeEnum.PAYMENT_ALREADY_AUTHORIZED }
};

/** Pre Authorize payment */
addIdPayHandler("put", "/payment/qr-code/:trxCode/relate-user", (req, res) =>
  pipe(
    req.params.trxCode,
    O.fromNullable,
    O.map(trxCode => trxCode[trxCode.length - 2]),
    O.map(parseInt),
    O.chain(code => O.fromNullable(codeToFailure[code])),
    O.fold(
      () =>
        res.status(200).json({
          ...generateRandomAuthPaymentResponseDTO(),
          trxCode: req.params.trxCode
        }),
      ({ status, code }) =>
        res.status(status).json(generateRandomTransactionError(code))
    )
  )
);

/** Authorize payment */
addIdPayHandler("put", "/payment/qr-code/:trxCode/authorize", (req, res) =>
  pipe(
    req.params.trxCode,
    O.fromNullable,
    O.map(trxCode => trxCode[trxCode.length - 1]),
    O.map(parseInt),
    O.chain(code => O.fromNullable(codeToFailure[code])),
    O.fold(
      () =>
        res.status(200).json({
          ...generateRandomAuthPaymentResponseDTO(),
          trxCode: req.params.trxCode
        }),
      ({ status, code }) =>
        res.status(status).json(generateRandomTransactionError(code))
    )
  )
);

addIdPayHandler("delete", "/payment/qr-code/:trxCode", (req, res) =>
  pipe(
    req.params.trxCode,
    O.fromNullable,
    O.map(trxCode => trxCode[trxCode.length - 1]),
    O.map(parseInt),
    O.chain(code => O.fromNullable(codeToFailure[code])),
    O.fold(
      () => res.sendStatus(200),
      ({ status, code }) =>
        res.status(status).json(generateRandomTransactionError(code))
    )
  )
);
