import { fakerIT as faker } from "@faker-js/faker";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import {
  InitiativeDetailDTO,
  StatusEnum
} from "../../../../generated/definitions/idpay/InitiativeDetailDTO";
import { InitiativeDTO } from "../../../../generated/definitions/idpay/InitiativeDTO";
import ServicesDB from "../../../features/services/persistence/servicesDatabase";
import { initiatives } from "../../../persistence/idpay";

const generateRandomInitiativeDetailDTO = (
  initiative: InitiativeDTO
): InitiativeDetailDTO => {
  const serviceSummaries = ServicesDB.getSummaries();

  return {
    initiativeName: initiative.initiativeName,
    status: StatusEnum.APPROVED,
    description: faker.lorem.paragraphs(6),
    ruleDescription: faker.lorem.paragraphs(4),
    onboardingStartDate: faker.date.past({ years: 6 }),
    onboardingEndDate: faker.date.future({ years: 2 }),
    privacyLink: faker.internet.url(),
    tcLink: faker.internet.url(),
    logoURL: initiative.logoURL,
    updateDate: faker.date.recent({ days: 1 }),
    serviceId: faker.helpers.arrayElement(serviceSummaries).service_id
  };
};

export const getInitiativeBeneficiaryDetailResponse = (
  initiativeId: string
): O.Option<InitiativeDetailDTO> =>
  pipe(
    initiatives[initiativeId],
    O.fromNullable,
    O.map(generateRandomInitiativeDetailDTO)
  );
