import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { InitiativeDto } from "../../../../../definitions/idpay/onboarding/InitiativeDto";
import { OnboardingClient } from "../api/client";
import { Context } from "./machine";

const createServicesImplementation = (onboardingClient: OnboardingClient) => {
  const loadInitiative = async (context: Context) => {
    if (context.serviceId === undefined) {
      return Promise.reject("serviceId is undefined");
    }

    const response = await onboardingClient.getInitiativeId({
      serviceId: context.serviceId
    });

    const data: Promise<InitiativeDto> = pipe(
      response,
      E.fold(
        _ => Promise.reject("error loading initiative"),
        _ => {
          if (_.status !== 200) {
            return Promise.reject("error loading initiative");
          }
          return Promise.resolve(_.value);
        }
      )
    );

    return data;
  };

  const acceptTos = async (context: Context) => {
    if (context.initative === undefined) {
      throw new Error("initative is undefined");
    }
    const response = await onboardingClient.onboardingCitizen({
      body: {
        initiativeId: context.initative.initiativeId
      }
    });

    const dataPromise: Promise<undefined> = pipe(
      response,
      E.fold(
        _ => Promise.reject(new Error("Error accepting tos")),
        _ => {
          if (_.status !== 204) {
            return Promise.reject(new Error("Error accepting tos"));
          }
          return Promise.resolve(undefined);
        }
      )
    );

    return dataPromise;
  };

  return {
    loadInitiative,
    acceptTos
  };
};

export { createServicesImplementation };
