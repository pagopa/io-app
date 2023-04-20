/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { ErrorDTO } from "../../../../../../definitions/idpay/ErrorDTO";
import {
  OnboardingStatusDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../../definitions/idpay/RequiredCriteriaDTO";
import { _typeEnum as BoolTypeEnum } from "../../../../../../definitions/idpay/SelfConsentBoolDTO";
import { SelfConsentDTO } from "../../../../../../definitions/idpay/SelfConsentDTO";
import {
  SelfConsentMultiDTO,
  _typeEnum as MultiTypeEnum
} from "../../../../../../definitions/idpay/SelfConsentMultiDTO";
import { mockIDPayClient } from "../../../common/api/__mocks__/client";
import { OnboardingFailureEnum } from "../failure";
import { Context } from "../machine";
import { createServicesImplementation } from "../services";
import { InitiativeDataDTO } from "../../../../../../definitions/idpay/InitiativeDataDTO";

const T_PREFERRED_LANGUAGE = PreferredLanguageEnum.it_IT;
const T_AUTH_TOKEN = "abc123";

const T_CONTEXT: Context = {
  failure: O.none,
  initiativeStatus: O.none,
  multiConsentsAnswers: {},
  multiConsentsPage: 0,
  selfDeclarationBoolAnswers: {}
};

const T_SERVICE_ID = "efg456";

const T_INITIATIVE_DATA_DTO: InitiativeDataDTO = {
  initiativeId: "1234",
  description: "",
  initiativeName: "abc",
  organizationId: "123",
  organizationName: "abc",
  privacyLink: "abc",
  tcLink: "abc"
};

const T_REQUIRED_CRITERIA_DTO: RequiredCriteriaDTO = {
  pdndCriteria: [
    {
      authority: "a",
      code: "b",
      description: "c",
      value: "d"
    }
  ],
  selfDeclarationList: [
    {
      _type: MultiTypeEnum.multi,
      code: "1",
      description: "a",
      value: ["A", "B", "C"]
    },
    {
      _type: MultiTypeEnum.multi,
      code: "2",
      description: "b",
      value: ["D", "E", "F"]
    },
    {
      _type: BoolTypeEnum.boolean,
      code: "3",
      description: "c",
      value: false
    }
  ]
};

const T_MULTI_CONSENTS_ANSWERS: Record<number, SelfConsentMultiDTO> = {
  1: {
    _type: MultiTypeEnum.multi,
    code: "1",
    value: "A"
  },
  2: {
    _type: MultiTypeEnum.multi,
    code: "2",
    value: "D"
  }
};

const T_ACCEPTED_SELF_DECLARATION_LIST: Array<SelfConsentDTO> = [
  {
    _type: BoolTypeEnum.boolean,
    code: "3",
    accepted: true
  },
  ...Object.values(T_MULTI_CONSENTS_ANSWERS)
] as Array<SelfConsentDTO>;

describe("IDPay Onboarding machine services", () => {
  const services = createServicesImplementation(
    mockIDPayClient,
    T_AUTH_TOKEN,
    T_PREFERRED_LANGUAGE
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadInitiative", () => {
    it("should fail if not service id is provided in context", async () => {
      await expect(services.loadInitiative(T_CONTEXT)).rejects.toMatch(
        OnboardingFailureEnum.GENERIC
      );

      expect(mockIDPayClient.getInitiativeData).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockIDPayClient.getInitiativeData.mockImplementation(() => response);

      await expect(
        services.loadInitiative({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockIDPayClient.getInitiativeData).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          serviceId: T_SERVICE_ID
        })
      );
    });

    it("should get initiative data", async () => {
      const response: E.Either<
        Error,
        { status: number; value?: InitiativeDataDTO }
      > = E.right({ status: 200, value: T_INITIATIVE_DATA_DTO });

      mockIDPayClient.getInitiativeData.mockImplementation(() => response);

      await expect(
        services.loadInitiative({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID
        })
      ).resolves.toMatchObject(T_INITIATIVE_DATA_DTO);

      expect(mockIDPayClient.getInitiativeData).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          serviceId: T_SERVICE_ID
        })
      );
    });
  });

  describe("loadInitiativeStatus", () => {
    it("should fail if initiative is not provided with context", async () => {
      await expect(services.loadInitiativeStatus(T_CONTEXT)).rejects.toMatch(
        OnboardingFailureEnum.GENERIC
      );

      expect(mockIDPayClient.onboardingStatus).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockIDPayClient.onboardingStatus.mockImplementation(() => response);

      await expect(
        services.loadInitiativeStatus({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockIDPayClient.onboardingStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_DATA_DTO.initiativeId
        })
      );
    });

    it("should return none if response status code == 404", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 404, value: { code: 0, message: "" } });

      mockIDPayClient.onboardingStatus.mockImplementation(() => response);

      await expect(
        services.loadInitiativeStatus({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO
        })
      ).resolves.toMatchObject(O.none);

      expect(mockIDPayClient.onboardingStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_DATA_DTO.initiativeId
        })
      );
    });

    const statusFailures: ReadonlyArray<
      [status: StatusEnum, failure: OnboardingFailureEnum]
    > = [
      [StatusEnum.ELIGIBLE_KO, OnboardingFailureEnum.NOT_ELIGIBLE],
      [StatusEnum.ONBOARDING_KO, OnboardingFailureEnum.NO_REQUIREMENTS],
      [StatusEnum.ONBOARDING_OK, OnboardingFailureEnum.ONBOARDED],
      [StatusEnum.UNSUBSCRIBED, OnboardingFailureEnum.UNSUBSCRIBED],
      [StatusEnum.ELIGIBLE, OnboardingFailureEnum.ON_EVALUATION],
      [StatusEnum.ON_EVALUATION, OnboardingFailureEnum.ON_EVALUATION]
    ];

    test.each(statusFailures)(
      "if initiative status is %p, should get failure %p",
      async (status, failure) => {
        const response: E.Either<
          Error,
          { status: number; value?: OnboardingStatusDTO }
        > = E.right({ status: 200, value: { status } });

        mockIDPayClient.onboardingStatus.mockImplementation(() => response);

        await expect(
          services.loadInitiativeStatus({
            ...T_CONTEXT,
            serviceId: T_SERVICE_ID,
            initiative: T_INITIATIVE_DATA_DTO
          })
        ).rejects.toMatch(failure);
      }
    );

    const allowedStatuses: ReadonlyArray<[status: StatusEnum]> = [
      [StatusEnum.ACCEPTED_TC],
      [StatusEnum.INVITED]
    ];

    test.each(allowedStatuses)(
      "if initiative status is %p, should succeed and return it",
      async status => {
        const response: E.Either<
          Error,
          { status: number; value?: OnboardingStatusDTO }
        > = E.right({ status: 200, value: { status } });

        mockIDPayClient.onboardingStatus.mockImplementation(() => response);

        await expect(
          services.loadInitiativeStatus({
            ...T_CONTEXT,
            serviceId: T_SERVICE_ID,
            initiative: T_INITIATIVE_DATA_DTO
          })
        ).resolves.toMatchObject(O.some(status));
      }
    );
  });

  describe("acceptTos", () => {
    it("should fail if initiative is not provided with context", async () => {
      await expect(services.acceptTos(T_CONTEXT)).rejects.toMatch(
        OnboardingFailureEnum.GENERIC
      );

      expect(mockIDPayClient.onboardingCitizen).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 204", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockIDPayClient.onboardingCitizen.mockImplementation(() => response);

      await expect(
        services.acceptTos({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockIDPayClient.onboardingCitizen).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DATA_DTO.initiativeId
          }
        })
      );
    });

    it("should return undefined if response status code = 204", async () => {
      const response: E.Either<Error, { status: number; value?: undefined }> =
        E.right({ status: 204, value: undefined });

      mockIDPayClient.onboardingCitizen.mockImplementation(() => response);

      await expect(
        services.acceptTos({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO
        })
      ).resolves.toBeUndefined();

      expect(mockIDPayClient.onboardingCitizen).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DATA_DTO.initiativeId
          }
        })
      );
    });
  });

  describe("loadRequiredCriteria", () => {
    it("should fail if initiative is not provided with context", async () => {
      await expect(services.loadRequiredCriteria(T_CONTEXT)).rejects.toMatch(
        OnboardingFailureEnum.GENERIC
      );

      expect(mockIDPayClient.checkPrerequisites).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 200 or 202", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockIDPayClient.checkPrerequisites.mockImplementation(() => response);

      await expect(
        services.loadRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockIDPayClient.checkPrerequisites).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DATA_DTO.initiativeId
          }
        })
      );
    });

    it("should return O.none if response status code is 202", async () => {
      const response: E.Either<Error, { status: number; value?: undefined }> =
        E.right({ status: 202, value: undefined });

      mockIDPayClient.checkPrerequisites.mockImplementation(() => response);

      await expect(
        services.loadRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO
        })
      ).resolves.toMatchObject(O.none);

      expect(mockIDPayClient.checkPrerequisites).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DATA_DTO.initiativeId
          }
        })
      );
    });

    it("should return citizen's required criteria if request is success", async () => {
      const response: E.Either<
        Error,
        { status: number; value?: RequiredCriteriaDTO }
      > = E.right({
        status: 200,
        value: T_REQUIRED_CRITERIA_DTO
      });

      mockIDPayClient.checkPrerequisites.mockImplementation(() => response);

      await expect(
        services.loadRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO
        })
      ).resolves.toMatchObject(O.some(T_REQUIRED_CRITERIA_DTO));

      expect(mockIDPayClient.checkPrerequisites).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DATA_DTO.initiativeId
          }
        })
      );
    });
  });

  describe("acceptRequiredCriteria", () => {
    it("should fail if initiative or required criterias are not provided with context", async () => {
      await expect(services.acceptRequiredCriteria(T_CONTEXT)).rejects.toMatch(
        OnboardingFailureEnum.GENERIC
      );

      expect(mockIDPayClient.consentOnboarding).toHaveBeenCalledTimes(0);
    });

    it("should fail if required criteria in context is none", async () => {
      await expect(
        services.acceptRequiredCriteria({
          ...T_CONTEXT,
          requiredCriteria: O.none
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockIDPayClient.consentOnboarding).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 202", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDTO }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockIDPayClient.consentOnboarding.mockImplementation(() => response);

      await expect(
        services.acceptRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO,
          requiredCriteria: O.some(T_REQUIRED_CRITERIA_DTO),
          multiConsentsAnswers: T_MULTI_CONSENTS_ANSWERS
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockIDPayClient.consentOnboarding).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DATA_DTO.initiativeId,
            pdndAccept: true,
            selfDeclarationList: T_ACCEPTED_SELF_DECLARATION_LIST
          }
        })
      );
    });

    it("should return undefined if success", async () => {
      const response: E.Either<Error, { status: number; value?: undefined }> =
        E.right({ status: 202, value: undefined });

      mockIDPayClient.consentOnboarding.mockImplementation(() => response);

      await expect(
        services.acceptRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DATA_DTO,
          requiredCriteria: O.some(T_REQUIRED_CRITERIA_DTO),
          multiConsentsAnswers: T_MULTI_CONSENTS_ANSWERS
        })
      ).resolves.toBeUndefined();

      expect(mockIDPayClient.consentOnboarding).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DATA_DTO.initiativeId,
            pdndAccept: true,
            selfDeclarationList: T_ACCEPTED_SELF_DECLARATION_LIST
          }
        })
      );
    });
  });
});
