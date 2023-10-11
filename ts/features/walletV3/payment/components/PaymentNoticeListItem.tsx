import { ListItemTransaction } from "@pagopa/io-app-design-system";
import { AmountInEuroCents } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { toInteger } from "lodash";
import React from "react";
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
    <ListItemTransaction
      title={paymentNoticeNumber}
      subtitle={organizationFiscalCode}
      transactionAmount={amountString}
      onPress={onPress}
      hasChevronRight={true}
      transactionStatus="success"
    />
  );
};

export { PaymentNoticeListItem };
