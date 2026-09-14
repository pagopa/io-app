import { ScopeTypeEnum } from "@io-app/api-types/generated/definitions/services/ScopeType";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import _ from "lodash";

import {
  createServiceFromFactory,
  createServiceMetadataFromFactory
} from "../../../features/services/persistence/services/factory";
import { backendStatus } from "../../backend";
import { IDPayServiceID } from "./types";

const serviceIds = _.pickBy(IDPayServiceID, (value, key) => isNaN(Number(key)));

// IDPay services are only generated if the onboarding flag is enabled in backend config
export const generateIDPayServices = (): Array<ServiceDetails> => {
  const isIdPayEnabled =
    backendStatus.config.idPay?.onboarding?.enabled ?? false;

  return isIdPayEnabled
    ? Object.values(serviceIds).map((serviceId, index) => {
        const paddedId = serviceId.toString().padStart(2, "0");
        return {
          ...createServiceFromFactory(`TESTSRV${paddedId}` as string),
          organization: {
            fiscal_code: index
              .toString()
              .padStart(11, "0") as OrganizationFiscalCode,
            name: `TESTSRV${paddedId}` as NonEmptyString
          },
          metadata: {
            ...createServiceMetadataFromFactory(ScopeTypeEnum.NATIONAL)
          },
          name: `TESTSRV${paddedId}` as NonEmptyString
        };
      })
    : [];
};
