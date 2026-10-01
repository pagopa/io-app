import {
  AutomatedCriteriaDTO,
  CodeEnum,
  OperatorEnum
} from "@io-app/api-types/generated/definitions/idpay/AutomatedCriteriaDTO";
import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";

import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";

const getPDNDCriteriaValueString = (
  code?: CodeEnum,
  value?: string
): string => {
  switch (code) {
    case CodeEnum.ISEE:
      return pipe(
        NumberFromString.decode(value),
        O.fromEither,
        O.map(formatNumberCentsToAmount),
        O.map(valueString => `${valueString} €`),
        O.getOrElse(() => "-")
      );
    default:
      return pipe(
        O.fromNullable(value),
        O.getOrElse(() => "-")
      );
  }
};

const getPDNDCriteriaOperatorDescription = (
  operator: OperatorEnum,
  values: { value: string; value2: string }
): string => {
  switch (operator) {
    case OperatorEnum.BTW_CLOSED:
      return I18n.t(
        "idpay.onboarding.PDNDPrerequisites.operator.BTW_CLOSED",
        values
      );
    case OperatorEnum.BTW_OPEN:
      return I18n.t(
        "idpay.onboarding.PDNDPrerequisites.operator.BTW_OPEN",
        values
      );
    case OperatorEnum.EQ:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.operator.EQ", values);
    case OperatorEnum.GE:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.operator.GE", values);
    case OperatorEnum.GT:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.operator.GT", values);
    case OperatorEnum.LE:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.operator.LE", values);
    case OperatorEnum.LT:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.operator.LT", values);
    case OperatorEnum.NOT_EQ:
      return I18n.t(
        "idpay.onboarding.PDNDPrerequisites.operator.NOT_EQ",
        values
      );
  }
};

const getPDNDCriteriaDescription = (criteria: AutomatedCriteriaDTO) =>
  pipe(
    criteria.operator,
    O.fromNullable,
    O.map(operator =>
      getPDNDCriteriaOperatorDescription(operator, {
        value: getPDNDCriteriaValueString(criteria.code, criteria.value),
        value2: getPDNDCriteriaValueString(criteria.code, criteria.value2)
      })
    ),
    O.getOrElse(() => "-")
  );

export { getPDNDCriteriaDescription, getPDNDCriteriaValueString };
