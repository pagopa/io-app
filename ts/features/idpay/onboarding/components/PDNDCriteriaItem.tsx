import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  CodeEnum,
  PDNDCriteriaDTO
} from "../../../../../definitions/idpay/PDNDCriteriaDTO";
import ButtonExtendedOutline from "../../../../components/ui/ButtonExtendedOutline";
import I18n from "../../../../i18n";
import { formatNumberAmount } from "../../../../utils/stringBuilder";

type Props = {
  criteria: PDNDCriteriaDTO;
  onPress: () => void;
};

const PDNDCriteriaItem = (props: Props) => {
  const { criteria, onPress } = props;
  const { code, operator, value } = criteria;

  const operatorString = pipe(
    operator,
    O.fromNullable,
    O.map(op => I18n.t(`idpay.onboarding.PDNDPrerequisites.operator.${op}`)),
    O.getOrElse(() => "")
  );

  const getValueString = () => {
    switch (code) {
      case CodeEnum.ISEE:
        return pipe(
          NumberFromString.decode(value),
          O.fromEither,
          O.map(value => formatNumberAmount(value)),
          O.map(valueString => `${operatorString} ${valueString} €`),
          O.getOrElse(() => "-")
        );
      default:
        return value;
    }
  };

  return (
    <ButtonExtendedOutline
      label={I18n.t(`idpay.onboarding.PDNDPrerequisites.code.${code}`)}
      description={getValueString()}
      onPress={onPress}
    />
  );
};

export { PDNDCriteriaItem };
