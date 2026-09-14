import {
  AutomatedCriteriaDTO,
  CodeEnum
} from "@io-app/api-types/generated/definitions/idpay/AutomatedCriteriaDTO";
import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import I18n from "i18next";

import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";

const getPDNDCriteriaValueString = (
  code?: CodeEnum,
  value?: string
): string => {
  switch (code) {
    case CodeEnum.ISEE:
      const decoded = NumberFromString.decode(value);
      return "right" in decoded
        ? `${formatNumberCentsToAmount(decoded.right)} €`
        : "-";
    default:
      return value ?? "-";
  }
};

const getPDNDCriteriaDescription = (criteria: AutomatedCriteriaDTO) => {
  if (!criteria.operator) {
    return "-";
  }
  return I18n.t(
    `idpay.onboarding.PDNDPrerequisites.operator.${criteria.operator}`,
    {
      value: getPDNDCriteriaValueString(criteria.code, criteria.value),
      value2: getPDNDCriteriaValueString(criteria.code, criteria.value2)
    }
  );
};

export { getPDNDCriteriaDescription, getPDNDCriteriaValueString };
