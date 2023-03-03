/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { ErrorDto } from "../../../../../../definitions/idpay/onboarding/ErrorDto";
import { InitiativeDto } from "../../../../../../definitions/idpay/onboarding/InitiativeDto";
import {
  OnboardingStatusDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/onboarding/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { _typeEnum as BoolTypeEnum } from "../../../../../../definitions/idpay/onboarding/SelfConsentBoolDTO";
import { SelfConsentDTO } from "../../../../../../definitions/idpay/onboarding/SelfConsentDTO";
import {
  SelfConsentMultiDTO,
  _typeEnum as MultiTypeEnum
} from "../../../../../../definitions/idpay/onboarding/SelfConsentMultiDTO";
import { OnboardingFailureEnum } from "../failure";
import { Context } from "../machine";
import { createServicesImplementation } from "../services";

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

const T_INITIATIVE_DTO: InitiativeDto = {
  initiativeId: "1234"
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

const mockOnboardingClient = {
  getInitiativeData: jest.fn(),
  checkPrerequisites: jest.fn(),
  consentOnboarding: jest.fn(),
  onboardingCitizen: jest.fn(),
  onboardingStatus: jest.fn()
};

describe("IDPay Onboarding machine services", () => {
  const services = createServicesImplementation(
    mockOnboardingClient,
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

      expect(mockOnboardingClient.getInitiativeData).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDto }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockOnboardingClient.getInitiativeData.mockImplementation(() => response);

      await expect(
        services.loadInitiative({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockOnboardingClient.getInitiativeData).toHaveBeenCalledWith(
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
        { status: number; value?: InitiativeDto }
      > = E.right({ status: 200, value: T_INITIATIVE_DTO });

      mockOnboardingClient.getInitiativeData.mockImplementation(() => response);

      await expect(
        services.loadInitiative({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID
        })
      ).resolves.toMatchObject(T_INITIATIVE_DTO);

      expect(mockOnboardingClient.getInitiativeData).toHaveBeenCalledWith(
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

      expect(mockOnboardingClient.onboardingStatus).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 200", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDto }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockOnboardingClient.onboardingStatus.mockImplementation(() => response);

      await expect(
        services.loadInitiativeStatus({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockOnboardingClient.onboardingStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_DTO.initiativeId
        })
      );
    });

    it("should return none if response status code == 404", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDto }> =
        E.right({ status: 404, value: { code: 0, message: "" } });

      mockOnboardingClient.onboardingStatus.mockImplementation(() => response);

      await expect(
        services.loadInitiativeStatus({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO
        })
      ).resolves.toMatchObject(O.none);

      expect(mockOnboardingClient.onboardingStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          initiativeId: T_INITIATIVE_DTO.initiativeId
        })
      );
    });

    const statusFailures: ReadonlyArray<
      [status: StatusEnum, failure: OnboardingFailureEnum]
    > = [
      [StatusEnum.ELIGIBILE_KO, OnboardingFailureEnum.NOT_ELIGIBLE],
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

        mockOnboardingClient.onboardingStatus.mockImplementation(
          () => response
        );

        await expect(
          services.loadInitiativeStatus({
            ...T_CONTEXT,
            serviceId: T_SERVICE_ID,
            initiative: T_INITIATIVE_DTO
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

        mockOnboardingClient.onboardingStatus.mockImplementation(
          () => response
        );

        await expect(
          services.loadInitiativeStatus({
            ...T_CONTEXT,
            serviceId: T_SERVICE_ID,
            initiative: T_INITIATIVE_DTO
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

      expect(mockOnboardingClient.onboardingCitizen).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 204", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDto }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockOnboardingClient.onboardingCitizen.mockImplementation(() => response);

      await expect(
        services.acceptTos({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockOnboardingClient.onboardingCitizen).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DTO.initiativeId
          }
        })
      );
    });

    it("should return undefined if response status code = 204", async () => {
      const response: E.Either<Error, { status: number; value?: undefined }> =
        E.right({ status: 204, value: undefined });

      mockOnboardingClient.onboardingCitizen.mockImplementation(() => response);

      await expect(
        services.acceptTos({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO
        })
      ).resolves.toBeUndefined();

      expect(mockOnboardingClient.onboardingCitizen).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DTO.initiativeId
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

      expect(mockOnboardingClient.checkPrerequisites).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 200 or 202", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDto }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockOnboardingClient.checkPrerequisites.mockImplementation(
        () => response
      );

      await expect(
        services.loadRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockOnboardingClient.checkPrerequisites).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DTO.initiativeId
          }
        })
      );
    });

    it("should return O.none if response status code is 202", async () => {
      const response: E.Either<Error, { status: number; value?: undefined }> =
        E.right({ status: 202, value: undefined });

      mockOnboardingClient.checkPrerequisites.mockImplementation(
        () => response
      );

      await expect(
        services.loadRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO
        })
      ).resolves.toMatchObject(O.none);

      expect(mockOnboardingClient.checkPrerequisites).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DTO.initiativeId
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

      mockOnboardingClient.checkPrerequisites.mockImplementation(
        () => response
      );

      await expect(
        services.loadRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO
        })
      ).resolves.toMatchObject(O.some(T_REQUIRED_CRITERIA_DTO));

      expect(mockOnboardingClient.checkPrerequisites).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DTO.initiativeId
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

      expect(mockOnboardingClient.consentOnboarding).toHaveBeenCalledTimes(0);
    });

    it("should fail if required criteria in context is none", async () => {
      await expect(
        services.acceptRequiredCriteria({
          ...T_CONTEXT,
          requiredCriteria: O.none
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockOnboardingClient.consentOnboarding).toHaveBeenCalledTimes(0);
    });

    it("should fail if response status code != 202", async () => {
      const response: E.Either<Error, { status: number; value?: ErrorDto }> =
        E.right({ status: 400, value: { code: 0, message: "" } });

      mockOnboardingClient.consentOnboarding.mockImplementation(() => response);

      await expect(
        services.acceptRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO,
          requiredCriteria: O.some(T_REQUIRED_CRITERIA_DTO),
          multiConsentsAnswers: T_MULTI_CONSENTS_ANSWERS
        })
      ).rejects.toMatch(OnboardingFailureEnum.GENERIC);

      expect(mockOnboardingClient.consentOnboarding).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DTO.initiativeId,
            pdndAccept: true,
            selfDeclarationList: T_ACCEPTED_SELF_DECLARATION_LIST
          }
        })
      );
    });

    it("should return undefined if success", async () => {
      const response: E.Either<Error, { status: number; value?: undefined }> =
        E.right({ status: 202, value: undefined });

      mockOnboardingClient.consentOnboarding.mockImplementation(() => response);

      await expect(
        services.acceptRequiredCriteria({
          ...T_CONTEXT,
          serviceId: T_SERVICE_ID,
          initiative: T_INITIATIVE_DTO,
          requiredCriteria: O.some(T_REQUIRED_CRITERIA_DTO),
          multiConsentsAnswers: T_MULTI_CONSENTS_ANSWERS
        })
      ).resolves.toBeUndefined();

      expect(mockOnboardingClient.consentOnboarding).toHaveBeenCalledWith(
        expect.objectContaining({
          bearerAuth: T_AUTH_TOKEN,
          "Accept-Language": T_PREFERRED_LANGUAGE,
          body: {
            initiativeId: T_INITIATIVE_DTO.initiativeId,
            pdndAccept: true,
            selfDeclarationList: T_ACCEPTED_SELF_DECLARATION_LIST
          }
        })
      );
    });
  });
});
