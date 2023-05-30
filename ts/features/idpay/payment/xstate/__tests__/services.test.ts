import * as E from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import {
  AuthPaymentResponseDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { ErrorDTO } from "../../../../../../definitions/idpay/ErrorDTO";
import { mockIDPayClient } from "../../../common/api/__mocks__/client";
import { Context } from "../context";
import { PaymentFailureEnum } from "../failure";
import { createServicesImplementation } from "../services";

const T_AUTH_TOKEN = "abc123";
const T_TRX_CODE = "123456";
const T_RESPONSE_DTO: AuthPaymentResponseDTO = {
  amountCents: 100,
  id: "",
  initiativeId: "",
  rejectionReasons: [],
  status: StatusEnum.AUTHORIZED,
  trxCode: ""
};

const T_CONTEXT: Context = {
  trxCode: undefined,
  transaction: undefined
};

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

    it("should get a UNAUTHORIZED failure if status code is 403", async () => {
      const response: E.Either<Errors, { status: number; value?: ErrorDTO }> =
        E.right({ status: 403, value: { code: "403", message: "" } });

      mockIDPayClient.putPreAuthPayment.mockImplementation(() => response);

      await expect(
        services.preAuthorizePayment({ ...T_CONTEXT, trxCode: T_TRX_CODE })
      ).rejects.toStrictEqual(PaymentFailureEnum.UNAUTHORIZED);

      expect(mockIDPayClient.putPreAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });

    it("should get a GENERIC failure if status codeis not 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 404, value: { code: "404", message: "" } });

      mockIDPayClient.putPreAuthPayment.mockImplementation(() => response);

      await expect(
        services.preAuthorizePayment({ ...T_CONTEXT, trxCode: T_TRX_CODE })
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
      > = E.right({ status: 200, value: T_RESPONSE_DTO });

      mockIDPayClient.putPreAuthPayment.mockImplementation(() => response);

      await expect(
        services.preAuthorizePayment({ ...T_CONTEXT, trxCode: T_TRX_CODE })
      ).resolves.toStrictEqual(T_RESPONSE_DTO);

      expect(mockIDPayClient.putPreAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });
  });

  describe("authorizePayment", () => {
    it("should fail if trxCode is not in context", async () => {
      await expect(services.authorizePayment(T_CONTEXT)).rejects.toStrictEqual(
        PaymentFailureEnum.GENERIC
      );

      expect(mockIDPayClient.putAuthPayment).not.toHaveBeenCalled();
    });

    it("should get a UNAUTHORIZED failure if status code is 403", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 403, value: { code: "403", message: "" } });

      mockIDPayClient.putAuthPayment.mockImplementation(() => response);

      await expect(
        services.authorizePayment({ ...T_CONTEXT, trxCode: T_TRX_CODE })
      ).rejects.toStrictEqual(PaymentFailureEnum.UNAUTHORIZED);

      expect(mockIDPayClient.putAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });

    it("should get a TIMEOUT failure if status code is 400", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: "400", message: "" } });

      mockIDPayClient.putAuthPayment.mockImplementation(() => response);

      await expect(
        services.authorizePayment({ ...T_CONTEXT, trxCode: T_TRX_CODE })
      ).rejects.toStrictEqual(PaymentFailureEnum.TIMEOUT);

      expect(mockIDPayClient.putAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });

    it("should get a GENERIC failure if status codeis not 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 404, value: { code: "404", message: "" } });

      mockIDPayClient.putAuthPayment.mockImplementation(() => response);

      await expect(
        services.authorizePayment({ ...T_CONTEXT, trxCode: T_TRX_CODE })
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
      > = E.right({ status: 200, value: T_RESPONSE_DTO });

      mockIDPayClient.putAuthPayment.mockImplementation(() => response);

      await expect(
        services.authorizePayment({ ...T_CONTEXT, trxCode: T_TRX_CODE })
      ).resolves.toStrictEqual(T_RESPONSE_DTO);

      expect(mockIDPayClient.putAuthPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          trxCode: T_TRX_CODE
        })
      );
    });
  });
});
