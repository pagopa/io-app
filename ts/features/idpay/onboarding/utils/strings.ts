import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import {
  CodeEnum,
  AutomatedCriteriaDTO
} from "../../../../../definitions/idpay/AutomatedCriteriaDTO";
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

const getPDNDCriteriaDescription = (criteria: AutomatedCriteriaDTO) =>
  pipe(
    criteria.operator,
    O.fromNullable,
    O.map(operator => ({
      operator,
      value: getPDNDCriteriaValueString(criteria.code, criteria.value),
      value2: getPDNDCriteriaValueString(criteria.code, criteria.value2)
    })),
    O.map(({ operator, value, value2 }) =>
      I18n.t(`idpay.onboarding.PDNDPrerequisites.operator.${operator}`, {
        value,
        value2
      })
    ),
    O.getOrElse(() => "-")
  );

export { getPDNDCriteriaValueString, getPDNDCriteriaDescription };
