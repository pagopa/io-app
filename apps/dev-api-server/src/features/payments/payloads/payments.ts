import { fakerIT as faker } from "@faker-js/faker";
import { PaymentRequestsGetResponse } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/RptId";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import ServicesDB from "../../services/persistence/servicesDatabase";

export const getPaymentRequestsGetResponse = (
  rptId: RptId
): O.Option<PaymentRequestsGetResponse> =>
  pipe(
    ServicesDB.getSummaries(),
    faker.helpers.arrayElement,
    ({ service_id }) => service_id,
    ServicesDB.getService,
    O.fromNullable,
    O.map((randomService: ServiceDetails) => ({
      rptId,
      amount: faker.number.int({
        min: 1,
        max: 9999
      }) as PaymentRequestsGetResponse["amount"],
      paFiscalCode: randomService.organization.fiscal_code,
      paName: randomService.organization.name,
      description: faker.finance.transactionDescription(),
      dueDate: faker.date.future()
    }))
  );
