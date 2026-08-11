import { fakerIT as faker } from "@faker-js/faker";
import { CitizenStatus } from "@io-app/api-types/generated/definitions/cdc/CitizenStatus";

export const CDC_CURRENT_STATUS: Readonly<CitizenStatus> = {
  number_of_cards: faker.number.int({ min: 1, max: 3 }),
  expiration_date: faker.date.future({ years: 1 })
};
