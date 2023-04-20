import * as React from "react";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { VSpacer } from "../../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../../components/core/typography/Body";
import I18n from "../../../../../../../i18n";
import { BpdTransactionDetailRepresentation } from "./BpdTransactionDetailComponent";

type Props = { transaction: BpdTransactionDetailRepresentation };

const TransactionWarning = (props: { text: string }) => (
  <>
    <VSpacer size={16} />
    <InfoBox>
      <Body>{props.text}</Body>
    </InfoBox>
  </>
);

/**
 * Displays a warning when certain conditions occur
 * @param props
 * @constructor
 */
export const BpdTransactionWarning: React.FunctionComponent<Props> = props => {
  // transaction not valid for cashback (eg: the user has already reached
  // the maximum cashback value for the period
  if (!props.transaction.validForCashback) {
    return (
      <TransactionWarning
        text={I18n.t(
          "bonus.bpd.details.transaction.detail.maxCashbackForPeriodWarning"
        )}
      />
    );
  }
  // max cashback for a single transaction reached
  if (
    props.transaction.maxCashbackForTransactionAmount ===
    props.transaction.cashback
  ) {
    return (
      <TransactionWarning
        text={I18n.t(
          "bonus.bpd.details.transaction.detail.maxCashbackWarning",
          {
            amount: props.transaction.maxCashbackForTransactionAmount
          }
        )}
      />
    );
  }
  // transaction canceled (negative amount)
  if (props.transaction.cashback < 0) {
    return (
      <TransactionWarning
        text={I18n.t(
          "bonus.bpd.details.transaction.detail.canceledOperationWarning"
        )}
      />
    );
  }
  return null;
};
