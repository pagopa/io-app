import { fakerIT as faker } from "@faker-js/faker";
import { OperationDTO } from "@io-app/api-types/generated/definitions/idpay/OperationDTO";
import { OperationListDTO } from "@io-app/api-types/generated/definitions/idpay/OperationListDTO";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";

import { initiativeTimeline } from "../../../persistence/idpay";

const generateRandomOperationDetailDTO = (
  operation: OperationListDTO
): OperationDTO | undefined => {
  switch (operation.operationType) {
    case "PAID_REFUND":
    case "REJECTED_REFUND":
      return {
        ...operation,
        cro: ulid(),
        iban: faker.finance.iban({ formatted: false }),
        startDate: faker.date.recent(),
        endDate: faker.date.recent(),
        transferDate: faker.date.recent()
      };
    case "REVERSAL":
    case "TRANSACTION":
      return {
        ...operation,
        accruedCents: operation.accruedCents || faker.number.int(10000),
        idTrxAcquirer: ulid(),
        idTrxIssuer: ulid()
      };
  }
};

export const getTimelineDetailResponse = (
  initiativeId: string,
  operationId: string
): O.Option<OperationDTO> =>
  pipe(
    initiativeTimeline[initiativeId],
    O.fromNullable,
    O.map(timeline => timeline.find(o => o.operationId === operationId)),
    O.chain(O.fromNullable),
    O.map(generateRandomOperationDetailDTO),
    O.chain(O.fromNullable)
  );
