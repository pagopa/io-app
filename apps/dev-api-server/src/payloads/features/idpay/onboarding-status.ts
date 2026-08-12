import { fakerIT as faker } from "@faker-js/faker";
import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "@io-app/api-types/generated/definitions/idpay/OnboardingStatusDTO";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { IDPayInitiativeID } from "./types";
import { initiativeIdFromString } from "./utils";

const onboardingStatuses: {
  [id: number]: OnboardingStatusDTO;
} = {
  [IDPayInitiativeID.OK_INVITED]: {
    status: OnboardingStatusEnum.INVITED,
    statusDate: faker.date.recent({ days: 1 })
  },
  [IDPayInitiativeID.KO_STATUS_NOT_ELIGIBLE]: {
    status: OnboardingStatusEnum.ELIGIBLE_KO,
    statusDate: faker.date.recent({ days: 1 })
  },
  [IDPayInitiativeID.KO_STATUS_NO_REQUIREMENTS]: {
    status: OnboardingStatusEnum.ELIGIBLE_KO,
    statusDate: faker.date.recent({ days: 1 })
  },
  [IDPayInitiativeID.KO_STATUS_ONBOARDED]: {
    status: OnboardingStatusEnum.ONBOARDING_OK,
    statusDate: faker.date.recent({ days: 1 }),
    onboardingOkDate: faker.date.recent({ days: 1 })
  },
  [IDPayInitiativeID.KO_STATUS_UNSUBSCRIBED]: {
    status: OnboardingStatusEnum.UNSUBSCRIBED,
    statusDate: faker.date.recent({ days: 1 }),
    onboardingOkDate: faker.date.recent({ days: 1 })
  },
  [IDPayInitiativeID.KO_STATUS_ON_EVALUATION]: {
    status: OnboardingStatusEnum.ON_EVALUATION,
    statusDate: faker.date.recent({ days: 1 })
  }
};

export const getOnboardingStatusResponseByInitiativeId = (
  id: string
): O.Option<OnboardingStatusDTO> =>
  pipe(
    O.some(id),
    O.map(
      // In case of randomly generated ulid, the status returned is ONBOARDING_OK
      flow(
        initiativeIdFromString,
        O.getOrElseW(() => IDPayInitiativeID.KO_STATUS_ONBOARDED)
      )
    ),
    O.chain(id => O.fromNullable(onboardingStatuses[id]))
  );
