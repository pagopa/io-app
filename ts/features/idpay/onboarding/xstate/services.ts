/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDto } from "../../../../../definitions/idpay/onboarding/InitiativeDto";
import { StatusEnum } from "../../../../../definitions/idpay/onboarding/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { SelfConsentDTO } from "../../../../../definitions/idpay/onboarding/SelfConsentDTO";
import { OnboardingClient } from "../api/client";
import { OnboardingFailureType } from "./failure";
import { Context } from "./machine";

/**
 * Temporary function to convert the required criteria to the self consents
 *
 * TODO: Process inputs from the citizen
 */
const createSelfConsents = (requiredCriteria: RequiredCriteriaDTO) => {
  const selfConsents: Array<SelfConsentDTO> =
    requiredCriteria.selfDeclarationList.map(_ => {
      if (_._type === "boolean") {
        return {
          _type: _._type,
          code: _.code,
          accepted: true
        };
      } else {
        return {
          _type: _._type,
          code: _.code,
          value: _.value[0]
        };
      }
    });

  return selfConsents;
};

const createServicesImplementation = (
  onboardingClient: OnboardingClient,
  token: string,
  language: PreferredLanguage
) => {
  const clientOptions = {
    bearerAuth: token,
    "Accept-Language": language
  };

  const loadInitiative = async (context: Context) => {
    if (context.serviceId === undefined) {
      return Promise.reject(OnboardingFailureType.GENERIC);
    }

    const dataResponse = await onboardingClient.getInitiativeData({
      ...clientOptions,
      serviceId: context.serviceId
    });

    const data: Promise<InitiativeDto> = pipe(
      dataResponse,
      E.fold(
        _ => Promise.reject(OnboardingFailureType.GENERIC),
        _ => {
          if (_.status !== 200) {
            return Promise.reject(OnboardingFailureType.GENERIC);
          }
          return Promise.resolve(_.value);
        }
      )
    );

    return data;
  };

  const loadInitiativeStatus = async (context: Context) => {
    if (context.initiative === undefined) {
      return Promise.reject(OnboardingFailureType.GENERIC);
    }

    const statusResponse = await onboardingClient.onboardingStatus({
      ...clientOptions,
      initiativeId: context.initiative.initiativeId
    });

    const data: Promise<StatusEnum | undefined> = pipe(
      statusResponse,
      E.fold(
        _ => Promise.reject(OnboardingFailureType.GENERIC),
        _ => {
          if (_.status === 404) {
            // 404 means initiative is yet to be started
            return Promise.resolve(undefined);
          } else if (_.status === 200) {
            return Promise.resolve(_.value.status);
          }

          return Promise.reject(OnboardingFailureType.GENERIC);
        }
      )
    );

    return data;
  };

  const acceptTos = async (context: Context) => {
    if (context.initiative === undefined) {
      return Promise.reject(OnboardingFailureType.GENERIC);
    }
    const response = await onboardingClient.onboardingCitizen({
      ...clientOptions,
      body: {
        initiativeId: context.initiative.initiativeId
      }
    });

    const dataPromise: Promise<undefined> = pipe(
      response,
      E.fold(
        _ => Promise.reject(OnboardingFailureType.GENERIC),
        _ => {
          if (_.status !== 204) {
            return Promise.reject(OnboardingFailureType.GENERIC);
          }
          return Promise.resolve(undefined);
        }
      )
    );

    return dataPromise;
  };

  const loadRequiredCriteria = async (context: Context) => {
    if (context.initiative === undefined) {
      return Promise.reject(OnboardingFailureType.GENERIC);
    }

    const response = await onboardingClient.checkPrerequisites({
      ...clientOptions,
      body: {
        initiativeId: context.initiative.initiativeId
      }
    });

    const dataPromise: Promise<O.Option<RequiredCriteriaDTO>> = pipe(
      response,
      E.fold(
        _ => Promise.reject(OnboardingFailureType.GENERIC),
        _ => {
          if (_.status === 200) {
            return Promise.resolve(O.some(_.value));
          }
          if (_.status === 202) {
            return Promise.resolve(O.none);
          }
          return Promise.reject(OnboardingFailureType.GENERIC);
        }
      )
    );

    return dataPromise;
  };

  const acceptRequiredCriteria = async (context: Context) => {
    const { initiative, requiredCriteria } = context;
    if (initiative === undefined || requiredCriteria === undefined) {
      return Promise.reject(OnboardingFailureType.GENERIC);
    }

    if (O.isNone(requiredCriteria)) {
      return Promise.reject(OnboardingFailureType.GENERIC);
    }

    const response = await onboardingClient.consentOnboarding({
      ...clientOptions,
      body: {
        initiativeId: initiative.initiativeId,
        pdndAccept: true,
        selfDeclarationList: createSelfConsents(requiredCriteria.value)
      }
    });

    const dataPromise: Promise<undefined> = pipe(
      response,
      E.fold(
        _ => Promise.reject(OnboardingFailureType.GENERIC),
        _ => {
          if (_.status !== 202) {
            return Promise.reject(OnboardingFailureType.GENERIC);
          }
          return Promise.resolve(undefined);
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
