/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { fromPromise } from "xstate";
import { TransientError } from "@pagopa/ts-commons/lib/tasks";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { CodeEnum as OnboardingErrorCodeEnum } from "../../../../../definitions/idpay/OnboardingErrorDTO";
import { OnboardingInitiativeDTO } from "../../../../../definitions/idpay/OnboardingInitiativeDTO";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { SelfConsentDTO } from "../../../../../definitions/idpay/SelfConsentDTO";
import { IDPayClient } from "../../common/api/client";
import {
  OnboardingFailure,
  OnboardingFailureEnum
} from "../types/OnboardingFailure";
import * as Context from "./context";
import { getBooleanSelfDeclarationListFromContext } from "./selectors";

/**
 * Checks if the error is a 429 Too Many Requests error that exhausted retries.
 * The defaultRetryingFetch converts 429 responses to TransientError and retries,
 * but after max retries it returns either TransientError or "max-retries" string.
 */
const isTooManyRequestsError = (error: unknown): boolean =>
  error === "max-retries" ||
  error === "retry-aborted" ||
  error === TransientError ||
  (error as Error)?.message === "TransientError";

/**
 * Handles errors from API calls, specifically checking for 429 Too Many Requests
 * errors that have exhausted retries and should be treated as TOO_MANY_REQUESTS failures.
 */
const handleApiError = (error: unknown): Promise<never> => {
  if (isTooManyRequestsError(error)) {
    return Promise.reject(OnboardingFailureEnum.ONBOARDING_TOO_MANY_REQUESTS);
  }
  return Promise.reject(OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR);
};

export const createActorsImplementation = (
  client: IDPayClient,
  token: string,
  language: PreferredLanguage
) => {
  const clientOptions = {
    bearerAuth: token,
    "Accept-Language": language
  };

  const getInitiativeInfo = fromPromise<InitiativeDataDTO, string>(
    async params => {
      try {
        const dataResponse = await client.getInitiativeData({
          ...clientOptions,
          serviceId: params.input
        });

        const data: Promise<InitiativeDataDTO> = pipe(
          dataResponse,
          E.fold(handleApiError, ({ status, value }) => {
            switch (status) {
              case 200:
                return Promise.resolve(value);
              case 401:
                return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
              case 429:
                return Promise.reject(
                  OnboardingFailureEnum.ONBOARDING_TOO_MANY_REQUESTS
                );
              default:
                return Promise.reject(
                  OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR
                );
            }
          })
        );

        return data;
      } catch (error) {
        return handleApiError(error);
      }
    }
  );

  const getOnboardingStatus = fromPromise<
    O.Option<OnboardingStatusEnum>,
    O.Option<string>
  >(async params => {
    if (O.isNone(params.input)) {
      throw new Error("Initiative ID was not provided");
    }

    try {
      const statusResponse = await client.onboardingStatus({
        ...clientOptions,
        initiativeId: params.input.value
      });

      const data: Promise<O.Option<OnboardingStatusEnum>> = pipe(
        statusResponse,
        E.fold(handleApiError, ({ status, value }) => {
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
            case 429:
              return Promise.reject(
                OnboardingFailureEnum.ONBOARDING_TOO_MANY_REQUESTS
              );
            default:
              return Promise.reject(
                OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR
              );
          }
        })
      );

      return data;
    } catch (error) {
      return handleApiError(error);
    }
  });

  const getRequiredCriteria = fromPromise<
    O.Option<OnboardingInitiativeDTO>,
    O.Option<string>
  >(async params => {
    if (O.isNone(params.input)) {
      throw new Error("Initiative ID was not provided");
    }

    try {
      const response = await client.initiativeDetail({
        ...clientOptions,
        initiativeId: params.input.value
      });

      const dataPromise: Promise<O.Option<OnboardingInitiativeDTO>> = pipe(
        response,
        E.fold(handleApiError, ({ status, value }) => {
          switch (status) {
            case 200:
              return Promise.resolve(O.some(value));
            case 401:
              return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
            case 429:
              return Promise.reject(
                OnboardingFailureEnum.ONBOARDING_TOO_MANY_REQUESTS
              );
            default:
              return Promise.reject(mapErrorCodeToFailure(value.code));
          }
        })
      );

      return dataPromise;
    } catch (error) {
      return handleApiError(error);
    }
  });

  const acceptRequiredCriteria = fromPromise<undefined, Context.Context>(
    async params => {
      const {
        initiative,
        requiredCriteria,
        selfDeclarationsMultiAnswers,
        selfDeclarationsTextAnswers
      } = params.input;

      if (O.isNone(initiative) || O.isNone(requiredCriteria)) {
        return Promise.reject(OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR);
      }

      if (requiredCriteria === undefined) {
        return Promise.reject(OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR);
      }

      const consentsArray = [
        ...getBooleanSelfDeclarationListFromContext(params.input).map(_ => ({
          _type: _._type,
          code: _.code,
          accepted: true
        })),
        ...Object.values(selfDeclarationsMultiAnswers),
        ...Object.values(selfDeclarationsTextAnswers)
      ] as Array<SelfConsentDTO>;

      try {
        const response = await client.saveOnboarding({
          ...clientOptions,
          body: {
            initiativeId: initiative.value.initiativeId,
            pdndAccept: true,
            confirmedTos: true,
            selfDeclarationList: consentsArray
          }
        });

        const dataPromise: Promise<undefined> = pipe(
          response,
          E.fold(handleApiError, ({ status, value }) => {
            switch (status) {
              case 202:
                return Promise.resolve(undefined);
              case 401:
                return Promise.reject(OnboardingFailureEnum.SESSION_EXPIRED);
              case 429:
                return Promise.reject(
                  OnboardingFailureEnum.ONBOARDING_TOO_MANY_REQUESTS
                );
              default:
                return Promise.reject(mapErrorCodeToFailure(value.code));
            }
          })
        );

        return dataPromise;
      } catch (error) {
        return handleApiError(error);
      }
    }
  );

  return {
    getInitiativeInfo,
    getOnboardingStatus,
    getRequiredCriteria,
    acceptRequiredCriteria
  };
};

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
      return OnboardingFailureEnum.ONBOARDING_ALREADY_ONBOARDED;
    case OnboardingStatusEnum.ELIGIBLE_KO:
      return OnboardingFailureEnum.NOT_ELIGIBLE;
    case OnboardingStatusEnum.ON_EVALUATION:
      return OnboardingFailureEnum.ONBOARDING_ON_EVALUATION;
    case OnboardingStatusEnum.UNSUBSCRIBED:
      return OnboardingFailureEnum.ONBOARDING_USER_UNSUBSCRIBED;
    case OnboardingStatusEnum.ONBOARDING_KO:
      return OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR;
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
      return OnboardingFailureEnum.ONBOARDING_INITIATIVE_NOT_FOUND;
    case OnboardingErrorCodeEnum.ONBOARDING_UNSATISFIED_REQUIREMENTS:
      return OnboardingFailureEnum.ONBOARDING_UNSATISFIED_REQUIREMENTS;
    case OnboardingErrorCodeEnum.ONBOARDING_USER_NOT_IN_WHITELIST:
      return OnboardingFailureEnum.ONBOARDING_USER_NOT_IN_WHITELIST;
    case OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_NOT_STARTED:
      return OnboardingFailureEnum.ONBOARDING_INITIATIVE_NOT_STARTED;
    case OnboardingErrorCodeEnum.ONBOARDING_INITIATIVE_ENDED:
      return OnboardingFailureEnum.ONBOARDING_INITIATIVE_ENDED;
    case OnboardingErrorCodeEnum.ONBOARDING_BUDGET_EXHAUSTED:
      return OnboardingFailureEnum.ONBOARDING_BUDGET_EXHAUSTED;
    case OnboardingErrorCodeEnum.ONBOARDING_USER_UNSUBSCRIBED:
      return OnboardingFailureEnum.ONBOARDING_USER_UNSUBSCRIBED;
    case OnboardingErrorCodeEnum.ONBOARDING_FAMILY_UNIT_ALREADY_JOINED:
      return OnboardingFailureEnum.ONBOARDING_FAMILY_UNIT_ALREADY_JOINED;
    case OnboardingErrorCodeEnum.ONBOARDING_WAITING_LIST:
      return OnboardingFailureEnum.ONBOARDING_WAITING_LIST;
    case OnboardingErrorCodeEnum.ONBOARDING_TOO_MANY_REQUESTS:
      return OnboardingFailureEnum.ONBOARDING_TOO_MANY_REQUESTS;
    case OnboardingErrorCodeEnum.ONBOARDING_ALREADY_ONBOARDED:
      return OnboardingFailureEnum.ONBOARDING_ALREADY_ONBOARDED;
    case OnboardingErrorCodeEnum.ONBOARDING_ON_EVALUATION:
      return OnboardingFailureEnum.ONBOARDING_ON_EVALUATION;
    default:
      return OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR;
  }
};
