import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {
  AuthPaymentResponseDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { mockIDPayClient } from "../../../common/api/__mocks__/client";
import { Context, INITIAL_CONTEXT } from "../context";
import { PaymentFailureEnum } from "../failure";
import { createServicesImplementation, failureMap } from "../services";
import {
  CodeEnum,
  TransactionErrorDTO
} from "../../../../../../definitions/idpay/TransactionErrorDTO";

const T_AUTH_TOKEN = "abc123";
const T_TRX_CODE = "ABCD1234";
const T_TRANSACTION_DATA_DTO: AuthPaymentResponseDTO = {
  amountCents: 100,
  id: "",
  initiativeId: "",
  status: StatusEnum.AUTHORIZED,
  trxCode: T_TRX_CODE
};

const T_CONTEXT: Context = INITIAL_CONTEXT;

const possibleFailures: ReadonlyArray<{ status: number; code: CodeEnum }> = [
  { status: 404, code: CodeEnum.PAYMENT_NOT_FOUND_EXPIRED },
  { status: 403, code: CodeEnum.PAYMENT_USER_NOT_VALID },
  { status: 400, code: CodeEnum.PAYMENT_STATUS_NOT_VALID },
  { status: 403, code: CodeEnum.PAYMENT_BUDGET_EXHAUSTED },
  { status: 403, code: CodeEnum.PAYMENT_GENERIC_REJECTED },
  { status: 429, code: CodeEnum.PAYMENT_TOO_MANY_REQUESTS },
  { status: 500, code: CodeEnum.PAYMENT_GENERIC_ERROR }
];

describe("IDPay Payment machine services", () => {
  const services = createServicesImplementation(mockIDPayClient, T_AUTH_TOKEN);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("preAuthorizePayment", () => {
    it("should fail if trxCode is not in context", async () => {
      await expect(
        services.preAuthorizePayment(T_CONTEXT)
      ).rejects.toStrictEqual(PaymentFailureEnum.GENERIC);

      expect(mockIDPayClient.putPreAuthPayment).not.toHaveBeenCalled();
    });

    it("should pre authorize payment", async () => {
      const response: E.Either<
        Error,
        { status: number; value?: AuthPaymentResponseDTO }
      > = E.right({ status: 200, value: T_TRANSACTION_DATA_DTO });

      mockIDPayClient.putPreAuthPayment.mockImplementation(() => response);

      await expect(
        services.preAuthorizePayment({
          ...T_CONTEXT,
          trxCode: O.some(T_TRX_CODE)
        })
      ).resolves.toStrictEqual(T_TRANSACTION_DATA_DTO);

      expect(mockIDPayClient.putPreAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });

    possibleFailures.forEach(({ status, code }) => {
      it(`should get a ${code} failure if status code is ${status}`, async () => {
        const response: E.Either<
          Error,
          { status: number; value?: TransactionErrorDTO }
        > = E.right({
          status,
          value: { code, message: "" }
        });

        mockIDPayClient.putPreAuthPayment.mockImplementation(() => response);

        await expect(
          services.preAuthorizePayment({
            ...T_CONTEXT,
            trxCode: O.some(T_TRX_CODE)
          })
        ).rejects.toStrictEqual(failureMap[code]);

        expect(mockIDPayClient.putPreAuthPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            bearerAuth: T_AUTH_TOKEN,
            trxCode: T_TRX_CODE
          })
        );
      });
    });
  });

  describe("authorizePayment", () => {
    it("should fail if transactionData is not in context", async () => {
      await expect(services.authorizePayment(T_CONTEXT)).rejects.toStrictEqual(
        PaymentFailureEnum.GENERIC
      );

      expect(mockIDPayClient.putAuthPayment).not.toHaveBeenCalled();
    });

    it("should authorize payment", async () => {
      const response: E.Either<
        Error,
        { status: number; value?: AuthPaymentResponseDTO }
      > = E.right({ status: 200, value: T_TRANSACTION_DATA_DTO });

      mockIDPayClient.putAuthPayment.mockImplementation(() => response);

      await expect(
        services.authorizePayment({
          ...T_CONTEXT,
          transactionData: O.some(T_TRANSACTION_DATA_DTO)
        })
      ).resolves.toStrictEqual(T_TRANSACTION_DATA_DTO);

      expect(mockIDPayClient.putAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });

    possibleFailures.forEach(({ status, code }) => {
      it(`should get a ${code} failure if status code is ${status}`, async () => {
        const response: E.Either<
          Error,
          { status: number; value?: TransactionErrorDTO }
        > = E.right({
          status,
          value: { code, message: "" }
        });

        mockIDPayClient.putAuthPayment.mockImplementation(() => response);

        await expect(
          services.authorizePayment({
            ...T_CONTEXT,
            transactionData: O.some(T_TRANSACTION_DATA_DTO)
          })
        ).rejects.toStrictEqual(failureMap[code]);

        expect(mockIDPayClient.putAuthPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            bearerAuth: T_AUTH_TOKEN,
            trxCode: T_TRX_CODE
          })
        );
      });
    });
  });
});
