/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { DetailsEnum as PrerequisitesErrorDetailsEnum } from "../../../../../definitions/idpay/PrerequisitesErrorDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfConsentDTO } from "../../../../../definitions/idpay/SelfConsentDTO";
import { IDPayClient } from "../../common/api/client";
import { OnboardingFailureEnum } from "./failure";
import { Context } from "./machine";
import { getBoolRequiredCriteriaFromContext } from "./selectors";

const onboardingStatusToFailure: Partial<
  Record<OnboardingStatusEnum, OnboardingFailureEnum>
> = {
  [OnboardingStatusEnum.ELIGIBLE_KO]: OnboardingFailureEnum.NOT_ELIGIBLE,
  [OnboardingStatusEnum.ONBOARDING_KO]: OnboardingFailureEnum.NO_REQUIREMENTS,
  [OnboardingStatusEnum.ONBOARDING_OK]: OnboardingFailureEnum.ONBOARDED,
  [OnboardingStatusEnum.UNSUBSCRIBED]: OnboardingFailureEnum.UNSUBSCRIBED,
  [OnboardingStatusEnum.ELIGIBLE]: OnboardingFailureEnum.ON_EVALUATION,
  [OnboardingStatusEnum.ON_EVALUATION]: OnboardingFailureEnum.ON_EVALUATION,
  [OnboardingStatusEnum.SUSPENDED]: OnboardingFailureEnum.SUSPENDED
};

// prettier-ignore
const prerequisitesErrorToFailure: Record<
  PrerequisitesErrorDetailsEnum,
  OnboardingFailureEnum
> = {
  [PrerequisitesErrorDetailsEnum.BUDGET_TERMINATED]: OnboardingFailureEnum.NO_BUDGET,
  [PrerequisitesErrorDetailsEnum.INITIATIVE_END]: OnboardingFailureEnum.ENDED,
  [PrerequisitesErrorDetailsEnum.INITIATIVE_NOT_STARTED]: OnboardingFailureEnum.NOT_STARTED,
  [PrerequisitesErrorDetailsEnum.INITIATIVE_SUSPENDED]: OnboardingFailureEnum.SUSPENDED,
  [PrerequisitesErrorDetailsEnum.GENERIC_ERROR]: OnboardingFailureEnum.GENERIC
};

const createServicesImplementation = (
  client: IDPayClient,
  token: string,
  language: PreferredLanguage
) => {
  const clientOptions = {
    bearerAuth: token,
    "Accept-Language": language
  };

  const loadInitiative = async (context: Context) => {
    if (context.serviceId === undefined) {
      return Promise.reject(OnboardingFailureEnum.GENERIC);
    }

    const dataResponse = await client.getInitiativeData({
      ...clientOptions,
      serviceId: context.serviceId
    });

    const data: Promise<InitiativeDataDTO> = pipe(
      dataResponse,
      E.fold(
        _ => Promise.reject(OnboardingFailureEnum.GENERIC),
        response => {
          if (response.status !== 200) {
            return Promise.reject(OnboardingFailureEnum.GENERIC);
          }
          return Promise.resolve(response.value);
        }
      )
    );

    return data;
  };

  const loadInitiativeStatus = async (context: Context) => {
    if (context.initiative === undefined) {
      return Promise.reject(OnboardingFailureEnum.GENERIC);
    }

    const statusResponse = await client.onboardingStatus({
      ...clientOptions,
      initiativeId: context.initiative.initiativeId
    });

    const data: Promise<O.Option<OnboardingStatusEnum>> = pipe(
      statusResponse,
      E.fold(
        _ => Promise.reject(OnboardingFailureEnum.GENERIC),
        response => {
          if (response.status === 200) {
            const onboardingStatus = response.value.status;

            return pipe(
              onboardingStatusToFailure[onboardingStatus],
              O.fromNullable,
              O.fold(
                () => Promise.resolve(O.some(response.value.status)), // No failure, return onboarding status
                failure => Promise.reject(failure)
              )
            );
          } else if (response.status === 404) {
            // Initiative not yet started by the citizen
            return Promise.resolve(O.none);
          }

          return Promise.reject(OnboardingFailureEnum.GENERIC);
        }
      )
    );

    return data;
  };

  const acceptTos = async (context: Context) => {
    if (context.initiative === undefined) {
      return Promise.reject(OnboardingFailureEnum.GENERIC);
    }

    const response = await client.onboardingCitizen({
      ...clientOptions,
      body: {
        initiativeId: context.initiative.initiativeId
      }
    });

    const dataPromise: Promise<undefined> = pipe(
      response,
      E.fold(
        _ => Promise.reject(OnboardingFailureEnum.GENERIC),
        response => {
          switch (response.status) {
            case 204:
              return Promise.resolve(undefined);
            case 403:
              const prerequisitesError = response.value.details;
              const failure = prerequisitesErrorToFailure[prerequisitesError];
              return Promise.reject(failure);
            default:
              return Promise.reject(OnboardingFailureEnum.GENERIC);
          }
        }
      )
    );

    return dataPromise;
  };

  const loadRequiredCriteria = async (context: Context) => {
    if (context.initiative === undefined) {
      return Promise.reject(OnboardingFailureEnum.GENERIC);
    }

    const response = await client.checkPrerequisites({
      ...clientOptions,
      body: {
        initiativeId: context.initiative.initiativeId
      }
    });

    const dataPromise: Promise<O.Option<RequiredCriteriaDTO>> = pipe(
      response,
      E.fold(
        _ => Promise.reject(OnboardingFailureEnum.GENERIC),
        response => {
          if (response.status === 200) {
            return Promise.resolve(O.some(response.value));
          } else if (response.status === 202) {
            return Promise.resolve(O.none);
          } else if (response.status === 403) {
            const prerequisitesError = response.value.details;
            const failure = prerequisitesErrorToFailure[prerequisitesError];
            return Promise.reject(failure);
          }
          return Promise.reject(OnboardingFailureEnum.GENERIC);
        }
      )
    );

    return dataPromise;
  };

  const acceptRequiredCriteria = async (context: Context) => {
    const { initiative, requiredCriteria, multiConsentsAnswers } = context;

    if (initiative === undefined || requiredCriteria === undefined) {
      return Promise.reject(OnboardingFailureEnum.GENERIC);
    }

    if (O.isNone(requiredCriteria)) {
      return Promise.reject(OnboardingFailureEnum.GENERIC);
    }

    const consentsArray = [
      ...getBoolRequiredCriteriaFromContext(context).map(_ => ({
        _type: _._type,
        code: _.code,
        accepted: true
      })),
      ...Object.values(multiConsentsAnswers)
    ] as Array<SelfConsentDTO>;

    const response = await client.consentOnboarding({
      ...clientOptions,
      body: {
        initiativeId: initiative.initiativeId,
        pdndAccept: true,
        selfDeclarationList: consentsArray
      }
    });

    const dataPromise: Promise<undefined> = pipe(
      response,
      E.fold(
        _ => Promise.reject(OnboardingFailureEnum.GENERIC),
        response => {
          if (response.status === 202) {
            return Promise.resolve(undefined);
          }
          return Promise.reject(OnboardingFailureEnum.GENERIC);
        }
      )
    );

    return dataPromise;
  };
  return {
    loadInitiative,
    loadInitiativeStatus,
    acceptTos,
    loadRequiredCriteria,
    acceptRequiredCriteria
  };
};

export { createServicesImplementation };
