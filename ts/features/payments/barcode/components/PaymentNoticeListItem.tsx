import { ListItemTransaction } from "@pagopa/io-app-design-system";
import { AmountInEuroCents } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { toInteger } from "lodash";

import { getAccessibleAmountText } from "../../../../utils/accessibility";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";

type Props = {
  amountInEuroCents: AmountInEuroCents;
  onPress: () => void;
  organizationFiscalCode: string;
  paymentNoticeNumber: string;
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
      onPress={onPress}
      showChevron
      subtitle={organizationFiscalCode}
      title={paymentNoticeNumber}
      transaction={{
        amount: amountString,
        amountAccessibilityLabel:
          getAccessibleAmountText(amountString) ?? amountString
      }}
    />
  );
};

export { PaymentNoticeListItem };
