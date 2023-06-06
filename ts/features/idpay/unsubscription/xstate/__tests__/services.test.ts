import * as E from "fp-ts/lib/Either";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { ErrorDTO } from "../../../../../../definitions/idpay/ErrorDTO";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { mockIDPayClient } from "../../../common/api/__mocks__/client";
import { Context } from "../context";

import { createServicesImplementation } from "../services";

const T_PREFERRED_LANGUAGE = PreferredLanguageEnum.it_IT;
const T_AUTH_TOKEN = "abc123";

const T_INITIATIVE_ID = "efg456";

const T_INITIATIVE_DTO: InitiativeDTO = {
  initiativeId: T_INITIATIVE_ID,
  status: StatusEnum.NOT_REFUNDABLE,
  endDate: new Date("2023-01-25T13:00:25.477Z"),
  nInstr: 1
};

const T_CONTEXT: Context = {
  initiativeId: T_INITIATIVE_ID
};

describe("IDPay Unsubscription machine services", () => {
  const services = createServicesImplementation(
    mockIDPayClient,
    T_AUTH_TOKEN,
    T_PREFERRED_LANGUAGE
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadInitiative", () => {
    it("should fail if response status code != 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: "0", message: "" } });

      mockIDPayClient.getWalletDetail.mockImplementation(() => response);

      await expect(
        services.getInitiativeInfo(T_CONTEXT)
      ).rejects.toBeUndefined();

      expect(mockIDPayClient.getWalletDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_ID
        })
      );
    });

    it("should get initiative data", async () => {
      const response: E.Either<
        Error,
        { status: number; value?: InitiativeDTO }
      > = E.right({ status: 200, value: T_INITIATIVE_DTO });

      mockIDPayClient.getWalletDetail.mockImplementation(() => response);

      await expect(
        services.getInitiativeInfo(T_CONTEXT)
      ).resolves.toMatchObject(T_INITIATIVE_DTO);

      expect(mockIDPayClient.getWalletDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_ID
        })
      );
    });
  });

  describe("unsubscribeFromInitiative", () => {
    it("should fail if response status code != 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: "0", message: "" } });

      mockIDPayClient.unsubscribe.mockImplementation(() => response);

      await expect(
        services.unsubscribeFromInitiative(T_CONTEXT)
      ).rejects.toBeUndefined();

      expect(mockIDPayClient.unsubscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_ID
        })
      );
    });

    it("should unsubscribe from initiative", async () => {
      const response: E.Either<Error, { status: number; value?: undefined }> =
        E.right({ status: 204, value: undefined });

      mockIDPayClient.unsubscribe.mockImplementation(() => response);

      await expect(
        services.unsubscribeFromInitiative(T_CONTEXT)
      ).resolves.toBeUndefined();

      expect(mockIDPayClient.unsubscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_ID
        })
      );
    });
  });
});
