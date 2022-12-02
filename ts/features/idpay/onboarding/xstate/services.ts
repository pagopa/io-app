/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
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

  const loadInitiativeStatus = async (initiativeId: string) => {
    const statusResponse = await onboardingClient.onboardingStatus({
      ...clientOptions,
      initiativeId
    });

    return pipe(
      statusResponse,
      E.fold(
        _ => Promise.reject(OnboardingFailureType.GENERIC),
        _ => {
          if (_.status === 404) {
            // 404 means there is no status yet for the initiaitve
            return Promise.resolve(undefined);
          } else if (_.status !== 200) {
            return Promise.reject(OnboardingFailureType.GENERIC);
          }

          return Promise.resolve(_.value.status);
        }
      )
    );
  };

  const loadInitiative = async (context: Context) => {
    if (context.serviceId === undefined) {
      throw new Error("serviceId is undefined");
    }

    const dataResponse = await onboardingClient.getInitiativeData({
      ...clientOptions,
      serviceId: context.serviceId
    });

    return pipe(
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
    ).then(async initiative => {
      const status = await loadInitiativeStatus(initiative.initiativeId);

      if (status === undefined) {
        return Promise.resolve(initiative);
      }

      if (status === StatusEnum.ONBOARDING_KO) {
        // In this case the initiative onboarding had a problem
        return Promise.reject(OnboardingFailureType.ONBOARDING_KO);
      } else if (status !== StatusEnum.ACCEPTED_TC) {
        // In this case the initiative onboarding was completed
        return Promise.reject(OnboardingFailureType.ALREADY_COMPLETED);
      }

      return Promise.resolve(initiative);
    });
  };

  const acceptTos = async (context: Context) => {
    if (context.initiative === undefined) {
      throw new Error("initative is undefined");
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
      throw new Error("initative is undefined");
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
      throw new Error("initative or requiredCriteria is undefined");
    }

    if (O.isNone(requiredCriteria)) {
      throw new Error("requiredCriteria is none");
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
        _ => Promise.reject("Error accepting required criteria"),
        _ => {
          if (_.status !== 202) {
            return Promise.reject("Error accepting required criteria");
          }
          return Promise.resolve(undefined);
        }
      )
    );

    return dataPromise;
  };

  return {
    loadInitiative,
    acceptTos,
    loadRequiredCriteria,
    acceptRequiredCriteria
  };
};

export { createServicesImplementation };
