import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  CodeEnum,
  OperatorEnum,
  PDNDCriteriaDTO
} from "../../../../../definitions/idpay/PDNDCriteriaDTO";
import ButtonExtendedOutline from "../../../../components/ui/ButtonExtendedOutline";
import I18n from "../../../../i18n";
import { formatNumberAmount } from "../../../../utils/stringBuilder";

type Props = {
  criteria: PDNDCriteriaDTO;
  onPress: () => void;
};

const getValueString = (code: CodeEnum, value?: string) => {
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
      return value;
  }
};

const PDNDCriteriaItem = (props: Props) => {
  const { criteria, onPress } = props;
  const { code, operator, value, value2 } = criteria;

  const firstValue = getValueString(code, value);
  const secondValue = getValueString(code, value2);

  const description = pipe(
    operator,
    O.fromNullable,
    O.alt(() => O.some(OperatorEnum.EQ)),
    O.map(op =>
      I18n.t(`idpay.onboarding.PDNDPrerequisites.operator.${op}`, {
        value: firstValue,
        value2: secondValue
      })
    ),
    O.getOrElse(() => "-")
  );

  return (
    <ButtonExtendedOutline
      label={I18n.t(`idpay.onboarding.PDNDPrerequisites.code.${code}`)}
      description={description}
      onPress={onPress}
    />
  );
};

export { PDNDCriteriaItem };
