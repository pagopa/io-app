/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { CodeEnum as OnboardingErrorCodeEnum } from "../../../../../definitions/idpay/OnboardingErrorDTO";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfConsentDTO } from "../../../../../definitions/idpay/SelfConsentDTO";
import { IDPayClient } from "../../common/api/client";
import {
  OnboardingFailure,
  OnboardingFailureEnum
} from "../types/OnboardingFailure";
import { Context } from "./machine";
import { getBoolRequiredCriteriaFromContext } from "./selectors";

/**
 * Maps the status of the initiative to a possibile UI failure state
 * @param status The status of the initiative
 * @returns A failure state enum, if any
 */
const mapOnboardingStatusToFailure = (
  status: OnboardingStatusEnum
): OnboardingFailure | undefined => {
  switch (status) {
    case OnboardingStatusEnum.ONBOARDING_OK:
    case OnboardingStatusEnum.SUSPENDED:
      return OnboardingFailureEnum.USER_ONBOARDED;
    case OnboardingStatusEnum.ELIGIBLE_KO:
      return OnboardingFailureEnum.NOT_ELIGIBLE;
    case OnboardingStatusEnum.ON_EVALUATION:
      return OnboardingFailureEnum.ON_EVALUATION;
    case OnboardingStatusEnum.UNSUBSCRIBED:
      return OnboardingFailureEnum.USER_UNSUBSCRIBED;
    case OnboardingStatusEnum.ONBOARDING_KO:
      return OnboardingFailureEnum.GENERIC;
    default:
      return undefined;
  }
};

/**
 * Maps the backed error codes to UI failure states
 * @param code Error code from backend
 * @returns The associated failure state
 */
const mapErrorCodeToFailure = (
  code: OnboardingErrorCodeEnum
): OnboardingFailure => {
  switch (code) {
    case OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_NOT_FOUND:
      return OnboardingFailureEnum.INITIATIVE_NOT_FOUND;
    case OnboardingErrorCodeEnum.ONBOARDING_UNSATISFIED_REQUIREMENTS:
      return OnboardingFailureEnum.UNSATISFIED_REQUIREMENTS;
    case OnboardingErrorCodeEnum.ONBOARDING_USER_NOT_IN_WHITELIST:
      return OnboardingFailureEnum.USER_NOT_IN_WHITELIST;
    case OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_NOT_STARTED:
      return OnboardingFailureEnum.INITIATIVE_NOT_STARTED;
    case OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_ENDED:
      return OnboardingFailureEnum.INITIATIVE_ENDED;
    case OnboardingErrorCodeEnum.ONBOARDING_BUDGET_EXHAUSTED:
      return OnboardingFailureEnum.BUDGET_EXHAUSTED;
    case OnboardingErrorCodeEnum.ONBOARDING_USER_UNSUBSCRIBED:
      return OnboardingFailureEnum.USER_UNSUBSCRIBED;
    default:
      return OnboardingFailureEnum.GENERIC;
  }
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
        ({ status, value }) => {
          switch (status) {
            case 200:
              return Promise.resolve(value);
            case 401:
              return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
            default:
              return Promise.reject(OnboardingFailureEnum.GENERIC);
          }
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
        ({ status, value }) => {
          switch (status) {
            case 200:
              return pipe(
                value.status,
                mapOnboardingStatusToFailure,
                O.fromNullable,
                O.fold(
                  () => Promise.resolve(O.some(value.status)), // No failure, return onboarding status
                  failure => Promise.reject(failure)
                )
              );
            case 404:
              // Initiative not yet started by the citizen
              return Promise.resolve(O.none);
            case 401:
              return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
            default:
              return Promise.reject(OnboardingFailureEnum.GENERIC);
          }
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
        ({ status, value }) => {
          switch (status) {
            case 204:
              return Promise.resolve(undefined);
            case 403:
              return Promise.reject(mapErrorCodeToFailure(value.code));
            case 401:
              return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
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
        ({ status, value }) => {
          switch (status) {
            case 200:
              return Promise.resolve(O.some(value));
            case 202:
              return Promise.resolve(O.none);
            case 403:
              return Promise.reject(mapErrorCodeToFailure(value.code));
            case 401:
              return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
            default:
              return Promise.reject(OnboardingFailureEnum.GENERIC);
          }
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
        ({ status }) => {
          switch (status) {
            case 202:
              return Promise.resolve(undefined);
            case 401:
              return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
            default:
              return Promise.reject(OnboardingFailureEnum.GENERIC);
          }
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
