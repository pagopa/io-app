import * as React from "react";
import { InfoBox } from "../../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../../components/core/typography/Body";
import I18n from "../../../../../../../../i18n";
import { dateToAccessibilityReadableFormat } from "../../../../../../../../utils/accessibility";
import { BpdAmount } from "../../../../../store/actions/amount";
import { BpdPeriod } from "../../../../../store/actions/periods";

type Props = {
  period: BpdPeriod;
  amount: BpdAmount;
  name: string;
};

/**
 * Display a warning for the current period if transactions < minTransaction and status === "Active"
 */
const CurrentPeriodWarning = (props: { period: BpdPeriod }) => (
  <InfoBox>
    <Body>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodKOBody",
        {
          transactions: props.period.minTransactionNumber
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * The user doesn't receive the amount (not enough transactions for the closed period)
 * @param props
 * @constructor
 */
const ClosedPeriodKO = (props: Props) => (
  <InfoBox>
    <Body>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.closedPeriodKOBody",
        {
          transactions: props.period.minTransactionNumber,
          amount: props.amount.totalCashback
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * The user will receive the refund!
 * @param props
 * @constructor
 */
const ClosedPeriodOK = (props: Props) => (
  <InfoBox iconName={"io-complete"}>
    <Body>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.closedPeriodOKBody",
        {
          name: props.name,
          amount: props.amount.totalCashback
        }
      )}
      {/* If the max amount is reached, inform the user */}
      {props.amount.totalCashback >= props.period.maxPeriodCashback
        ? ": " +
          I18n.t(
            "bonus.bpd.details.components.transactionsCountOverview.closedPeriodMaxAmount"
          )
        : "!"}
    </Body>
  </InfoBox>
);

/**
 * We await receipt of the latest transactions to consolidate the count
 * @param props
 * @constructor
 */
const GracePeriod = (props: { period: BpdPeriod }) => (
  <InfoBox iconName={"io-timer"}>
    <Body>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.gracePeriodBody",
        {
          date: dateToAccessibilityReadableFormat(props.period.endDate)
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * Inform the user about the start date of the next period
 * @param props
 * @constructor
 */
const InactivePeriod = (props: { period: BpdPeriod }) => (
  <InfoBox>
    <Body>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.inactivePeriodBody",
        {
          date: dateToAccessibilityReadableFormat(props.period.startDate)
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * Choose the textual infobox based on period and amount values
 * @param props
 */
const chooseTextualInfoBox = (props: Props) => {
  // active period but still not enough transaction
  switch (props.period.status) {
    case "Inactive":
      return <InactivePeriod period={props.period} />;
    case "Closed":
      const today = new Date();
      const endGracePeriod = new Date();
      endGracePeriod.setDate(
        props.period.endDate.getDate() + props.period.gracePeriod
      );
      // we are still in the grace period and warns the user that some transactions
      // may still be pending
      if (today <= endGracePeriod) {
        return <GracePeriod {...props} />;
      }
      // not enough transaction to receive the cashback
      if (props.amount.transactionNumber < props.period.minTransactionNumber) {
        return <ClosedPeriodKO {...props} />;
      }
      // Congratulation! cashback received
      return <ClosedPeriodOK {...props} />;
    case "Active":
      if (props.amount.transactionNumber < props.period.minTransactionNumber) {
        return <CurrentPeriodWarning period={props.period} />;
      }
  }
  return null;
};

/**
 * Render additional text information for the user, related to the transactions and cashback amount
 * @param props
 * @constructor
 */
export const TransactionsTextualSummary: React.FunctionComponent<Props> = props =>
  chooseTextualInfoBox(props);
