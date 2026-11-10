import { OnboardingDTO } from "@io-app/api-types/generated/definitions/idpay/OnboardingDTO";
import {
  CodeEnum as OnboardingErrorCodeEnum,
  OnboardingErrorDTO
} from "@io-app/api-types/generated/definitions/idpay/OnboardingErrorDTO";
import { StatusEnum as OnboardedInitiativeStatusEnum } from "@io-app/api-types/generated/definitions/idpay/UserOnboardingStatusDTO";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import {
  getCheckPrerequisitesResponseByInitiativeId,
  getPrerequisitesErrorByInitiativeId
} from "../../../payloads/features/idpay/check-prerequisites";
import { getIdPayError } from "../../../payloads/features/idpay/error";
import {
  getInitiativeDataResponseByInitiativeId,
  getInitiativeDataResponseByServiceId
} from "../../../payloads/features/idpay/get-initiative-data";
import { getOnboardingInitiativeUserStatus } from "../../../payloads/features/idpay/get-onboarding-initiative-user-status";
import { getOnboardingStatusResponseByInitiativeId } from "../../../payloads/features/idpay/onboarding-status";
import {
  initiativeIdFromString,
  serviceIdFromString
} from "../../../payloads/features/idpay/utils";
import { addOnboardedInitiativeStatus } from "../../../persistence/idpay";
import { addIdPayHandler } from "./router";

/** Retrieves the initiative ID starting from the corresponding service ID */
addIdPayHandler("get", "/onboarding/service/:serviceId", (req, res) =>
  pipe(
    req.params.serviceId,
    O.fromNullable,
    O.chain(serviceIdFromString),
    O.chain(getInitiativeDataResponseByServiceId),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiative => res.status(200).json(initiative)
    )
  )
);

addIdPayHandler("get", "/onboarding/:initiativeId/detail", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.fold(
      () => res.status(400).json(getIdPayError(400)), // Wrong request body
      flow(
        O.some,
        O.chain(initiativeIdFromString),
        O.fold(
          () => res.status(404).json(getIdPayError(404)), // Initiative not found
          initiativeId =>
            pipe(
              initiativeId,
              O.some,
              O.chain(getPrerequisitesErrorByInitiativeId),
              O.fold(
                () =>
                  pipe(
                    initiativeId,
                    O.some,
                    O.chain(getCheckPrerequisitesResponseByInitiativeId),
                    O.fold(
                      () => res.sendStatus(202), // Initiative without prerequisites
                      prerequisites => res.status(200).json(prerequisites) // Prerequisites found
                    )
                  ),
                prerequisitesError => res.status(400).json(prerequisitesError) // Initiative with prerequisites error
              )
            )
        )
      )
    )
  )
);

/** Returns the actual onboarding status */
addIdPayHandler("get", "/onboarding/:initiativeId/status", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getOnboardingStatusResponseByInitiativeId),
    O.fold(
      () =>
        res.status(404).json({
          code: OnboardingErrorCodeEnum.ONBOARDING_USER_NOT_ONBOARDED,
          message: ""
        } as OnboardingErrorDTO),
      status => res.status(200).json(status)
    )
  )
);

/** Check the initiative prerequisites */
addIdPayHandler("put", "/onboarding/", (req, res) =>
  pipe(
    OnboardingDTO.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.status(400).json(getIdPayError(400)), // Wrong request body
      flow(
        O.some,
        O.map(({ initiativeId }) => initiativeId),
        O.chain(initiativeIdFromString),
        O.fold(
          () => res.status(404).json(getIdPayError(404)), // Initiative not found
          initiativeId =>
            pipe(
              initiativeId,
              O.some,
              O.chain(getPrerequisitesErrorByInitiativeId),
              O.fold(
                () => {
                  addOnboardedInitiativeStatus(
                    getInitiativeDataResponseByInitiativeId(initiativeId),
                    OnboardedInitiativeStatusEnum.ON_WAITING_LIST
                  );
                  return res.sendStatus(202);
                },
                prerequisitesError => res.status(403).json(prerequisitesError) // Initiative with prerequisites error
              )
            )
        )
      )
    )
  )
);

/**
 * Returns all initiatives that the user is in waiting list or in evaluation
 * status
 */
addIdPayHandler("get", "/onboarding/user/initiative/status", (req, res) =>
  pipe(
    getOnboardingInitiativeUserStatus(),
    O.fold(
      () =>
        res.status(404).json({
          code: OnboardingErrorCodeEnum.ONBOARDING_INVALID_REQUEST,
          message: ""
        } as OnboardingErrorDTO),
      response => res.status(200).json(response)
    )
  )
);
