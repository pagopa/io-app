/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeDto } from "../../../../../definitions/idpay/onboarding/InitiativeDto";
import { StatusEnum } from "../../../../../definitions/idpay/onboarding/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { _typeEnum as boolSelfDeclarationTypeEnum } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { OnboardingClient } from "../api/client";
import { OnboardingFailureType } from "./failure";
import { Context, getBoolRequiredCriteria } from "./machine";

/**
 * Temporary function to convert the required criteria to the self consents
 *
 * TODO: Process inputs from the citizen
 */

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
      throw new Error("serviceId is undefined");
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
          return Promise.resolve({ initiativeId: "63d105e454f2c82a13f8b0c7" });
        }
      )
    );

    return data;
  };

  const loadInitiativeStatus = async (context: Context) => {
    if (context.initiative === undefined) {
      throw new Error("initiative is undefined");
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
    const {
      initiative,
      requiredCriteria,
      multiConsents: selfConsents
    } = context;
    if (initiative === undefined || requiredCriteria === undefined) {
      throw new Error("initative or requiredCriteria is undefined");
    }

    if (O.isNone(requiredCriteria)) {
      throw new Error("requiredCriteria is none");
    }

    const consentsArray = [
      ...getBoolRequiredCriteria(context).map(_ => ({
        _type: boolSelfDeclarationTypeEnum.boolean,
        code: _.code,
        accepted: true
      })),
      ...selfConsents
    ];
    const response = await onboardingClient.consentOnboarding({
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
    loadInitiativeStatus,
    acceptTos,
    loadRequiredCriteria,
    acceptRequiredCriteria
  };
};

export { createServicesImplementation };
