import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {
  AuthPaymentResponseDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { ErrorDTO } from "../../../../../../definitions/idpay/ErrorDTO";
import { mockIDPayClient } from "../../../common/api/__mocks__/client";
import { Context, INITIAL_CONTEXT } from "../context";
import { PaymentFailureEnum } from "../failure";
import { createServicesImplementation } from "../services";

const T_AUTH_TOKEN = "abc123";
const T_TRX_CODE = "ABCD1234";
const T_TRANSACTION_DATA_DTO: AuthPaymentResponseDTO = {
  amountCents: 100,
  id: "",
  initiativeId: "",
  rejectionReasons: [],
  status: StatusEnum.AUTHORIZED,
  trxCode: T_TRX_CODE
};

const T_CONTEXT: Context = INITIAL_CONTEXT;

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

    it("should get a GENERIC failure if status codeis not 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 404, value: { code: "404", message: "" } });

      mockIDPayClient.putPreAuthPayment.mockImplementation(() => response);

      await expect(
        services.preAuthorizePayment({
          ...T_CONTEXT,
          trxCode: O.some(T_TRX_CODE)
        })
      ).rejects.toStrictEqual(PaymentFailureEnum.GENERIC);

      expect(mockIDPayClient.putPreAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
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
  });

  describe("authorizePayment", () => {
    it("should fail if transactionData is not in context", async () => {
      await expect(services.authorizePayment(T_CONTEXT)).rejects.toStrictEqual(
        PaymentFailureEnum.GENERIC
      );

      expect(mockIDPayClient.putAuthPayment).not.toHaveBeenCalled();
    });

    it("should fail if status code is not 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: "400", message: "" } });

      mockIDPayClient.putAuthPayment.mockImplementation(() => response);

      await expect(
        services.authorizePayment({
          ...T_CONTEXT,
          transactionData: O.some(T_TRANSACTION_DATA_DTO)
        })
      ).rejects.toStrictEqual(PaymentFailureEnum.GENERIC);

      expect(mockIDPayClient.putAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });

    it("should fail if status code is 200 and transaction is not AUTHORIZED", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: "400", message: "" } });

      mockIDPayClient.putAuthPayment.mockImplementation(() => response);

      await expect(
        services.authorizePayment({
          ...T_CONTEXT,
          transactionData: O.some({
            ...T_TRANSACTION_DATA_DTO,
            status: StatusEnum.REJECTED
          })
        })
      ).rejects.toStrictEqual(PaymentFailureEnum.GENERIC);

      expect(mockIDPayClient.putAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
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
  });
});
