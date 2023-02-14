/* eslint-disable no-underscore-dangle */
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PreferredLanguage } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeInfoDTO } from "../../../../../definitions/idpay/InitiativeInfoDTO";
import { StatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfConsentDTO } from "../../../../../definitions/idpay/SelfConsentDTO";
import { IDPayClient } from "../../common/api/client";
import { OnboardingFailureType } from "./failure";
import { Context } from "./machine";
import { getBoolRequiredCriteriaFromContext } from "./selectors";

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
      throw new Error("serviceId is undefined");
    }

    const dataResponse = await client.getInitiativeData({
      ...clientOptions,
      serviceId: context.serviceId
    });

    const data: Promise<InitiativeInfoDTO> = pipe(
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
      throw new Error("initiative is undefined");
    }

    const statusResponse = await client.onboardingStatus({
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

    const response = await client.onboardingCitizen({
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

    const response = await client.checkPrerequisites({
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
    const { initiative, requiredCriteria, multiConsentsAnswers } = context;

    if (initiative === undefined || requiredCriteria === undefined) {
      throw new Error("initative or requiredCriteria is undefined");
    }

    if (O.isNone(requiredCriteria)) {
      throw new Error("requiredCriteria is none");
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
