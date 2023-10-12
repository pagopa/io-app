import {
  HSpacer,
  Icon,
  Label,
  PressableListItemBase
} from "@pagopa/io-app-design-system";
import { AmountInEuroCents } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { toInteger } from "lodash";
import React from "react";
import { View } from "react-native";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { NewH6 } from "../../../../components/core/typography/NewH6";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
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
        <Label weight="Regular" color="black">
          {paymentNoticeNumber}
        </Label>
        <LabelSmall weight="Regular" color="grey-700">
          {organizationFiscalCode}
        </LabelSmall>
      </View>
      <NewH6
        color="blueIO-450"
        accessibilityLabel={getAccessibleAmountText(amountString)}
      >
        {amountString}
      </NewH6>
      <HSpacer size={8} />
      <Icon name="chevronRight" color="blueIO-450" />
    </PressableListItemBase>
  );
};

export { PaymentNoticeListItem };
