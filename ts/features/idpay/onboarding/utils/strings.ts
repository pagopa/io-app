import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  CodeEnum,
  OperatorEnum,
  PDNDCriteriaDTO
} from "../../../../../definitions/idpay/PDNDCriteriaDTO";
import I18n from "../../../../i18n";
import { formatNumberAmount } from "../../../../utils/stringBuilder";

const getPDNDCriteriaValueString = (code: CodeEnum, value?: string): string => {
  switch (code) {
    case CodeEnum.ISEE:
      return pipe(
        NumberFromString.decode(value),
        O.fromEither,
        O.map(value => formatNumberAmount(value)),
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

const getPDNDCriteriaDescription = (criteria: PDNDCriteriaDTO) =>
  pipe(
    criteria.operator,
    O.fromNullable,
    O.alt(() => O.some(OperatorEnum.EQ)),
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
