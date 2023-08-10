import {
  H6,
  HSpacer,
  Icon,
  PressableListItemBase
} from "@pagopa/io-app-design-system";
import { AmountInEuroCents } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { toInteger } from "lodash";
import React from "react";
import { View } from "react-native";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { NewLabelSmall } from "../../../../components/core/typography/NewLabelSmall";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";

type Props = {
  paymentNoticeNumber: string;
  organizationFiscalCode: string;
  amountInEuroCents: AmountInEuroCents;
  onPress: () => void;
};

const PaymentNoticeListItem = ({
  paymentNoticeNumber,
  organizationFiscalCode,
  amountInEuroCents,
  onPress
}: Props) => {
  const amountString = pipe(
    toInteger(amountInEuroCents),
    O.fromNullable,
    O.map(centsToAmount),
    O.map(formatNumberAmount),
    O.map(amount => `${amount} €`),
    O.getOrElse(() => "")
  );

  return (
    <PressableListItemBase onPress={onPress}>
      <View style={{ flexGrow: 1 }}>
        <NewLabelSmall>{paymentNoticeNumber}</NewLabelSmall>
        <LabelSmall weight="Regular" color="grey-700">
          {organizationFiscalCode}
        </LabelSmall>
      </View>
      <H6 color="blueIO-450">{amountString}</H6>
      <HSpacer size={8} />
      <Icon name="chevronRight" color="blueIO-450" />
    </PressableListItemBase>
  );
};

export { PaymentNoticeListItem };
