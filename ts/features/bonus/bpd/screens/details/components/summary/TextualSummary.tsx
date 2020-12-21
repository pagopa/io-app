import * as React from "react";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../components/core/typography/Body";
import I18n from "../../../../../../../i18n";
import { dateToAccessibilityReadableFormat } from "../../../../../../../utils/accessibility";
import { formatNumberAmount } from "../../../../../../../utils/stringBuilder";
import { BpdPeriod } from "../../../../store/actions/periods";
import {
  BpdPeriodWithInfo,
  isBpdRankingReady
} from "../../../../store/reducers/details/periods";

type Props = {
  period: BpdPeriodWithInfo;
  name: string | undefined;
};

/**
 * Display a warning for the current period if transactions < minTransaction and status === "Active"
 */
const CurrentPeriodWarning = (props: { period: BpdPeriod }) => (
  <InfoBox iconName={"io-lucchetto"}>
    <Body testID={"currentPeriodWarning"}>
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
 * Display a message informing the user that the cashback is unlocked for the current period
 */
const CurrentPeriodUnlock = (props: Props) => (
  <InfoBox iconName={"io-locker-open"}>
    <Body testID={"currentPeriodUnlock"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodUnlockBody",
        {
          transactions: props.period.minTransactionNumber,
          name: props.name
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * Display a message informing the user that he reached the max cashback amount for the current period
 */
const CurrentPeriodMaxAmount = (props: { name: string | undefined }) => (
  <InfoBox iconName={"io-happy"}>
    <Body testID={"currentPeriodMaxAmount"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodMaxAmount",
        {
          name: props.name
        }
      )}
    </Body>
  </InfoBox>
);

/**
 * Display a message informing the user that at the moment he may be eligible for supercashback
 */
const CurrentPeriodSuperCashback = (props: { superCashbackAmount: number }) => (
  <InfoBox iconName={"io-abacus"}>
    <Body testID={"currentPeriodMaxAmount"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodSuperCashback",
        { superCashbackAmount: formatNumberAmount(props.superCashbackAmount) }
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
  <InfoBox iconName={"io-sad"}>
    <Body testID={"closedPeriodKO"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.closedPeriodKOBody",
        {
          transactions: props.period.minTransactionNumber,
          amount: props.period.amount.totalCashback
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
  <InfoBox iconName={"io-happy"}>
    <Body testID={"closedPeriodOK"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.closedPeriodOKBody",
        {
          name: props.name,
          amount: props.period.amount.totalCashback
        }
      )}
      {/* If the max amount is reached, inform the user */}
      {props.period.amount.totalCashback >= props.period.maxPeriodCashback
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
  <InfoBox iconName={"io-hourglass"}>
    <Body testID={"gracePeriod"}>
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
    <Body testID={"inactivePeriod"}>
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
  switch (props.period.status) {
    case "Inactive":
      return <InactivePeriod period={props.period} />;
    case "Closed":
      const today = new Date();
      const endGracePeriod = new Date(props.period.endDate);
      endGracePeriod.setDate(
        props.period.endDate.getDate() + props.period.gracePeriod
      );
      // we are still in the grace period and warns the user that some transactions
      // may still be pending
      if (today <= endGracePeriod && today >= props.period.endDate) {
        return <GracePeriod {...props} />;
      }
      // not enough transaction to receive the cashback
      if (
        props.period.amount.transactionNumber <
        props.period.minTransactionNumber
      ) {
        return <ClosedPeriodKO {...props} />;
      }
      // Congratulation! cashback received
      return <ClosedPeriodOK {...props} />;
    case "Active":
      // active period but still not enough transaction
      if (
        props.period.amount.transactionNumber <
          props.period.minTransactionNumber &&
        props.period.amount.totalCashback > 0 &&
        // hide with transactionNumber === 0
        props.period.amount.transactionNumber > 0
      ) {
        return <CurrentPeriodWarning period={props.period} />;
      }
      if (
        props.period.amount.transactionNumber >=
        props.period.minTransactionNumber
      ) {
        // The user is in the supercashback ranking atm
        if (
          isBpdRankingReady(props.period.ranking) &&
          props.period.ranking.ranking <= props.period.minPosition
        ) {
          console.log(props.period.superCashbackAmount);
          return (
            <CurrentPeriodSuperCashback
              superCashbackAmount={props.period.superCashbackAmount}
            />
          );
        }
        // The max cashback amount is reached
        {
          if (
            props.period.amount.totalCashback >= props.period.maxPeriodCashback
          ) {
            return <CurrentPeriodMaxAmount name={props.name} />;
          }
        }
        // Cashback unlocked! visible for the next 10 transaction only
        if (
          props.period.amount.transactionNumber <=
          props.period.minTransactionNumber + 10
        ) {
          return <CurrentPeriodUnlock {...props} />;
        }
      }
  }
  return null;
};

/**
 * Render additional text information for the user, related to the transactions and cashback amount
 * @param props
 * @constructor
 */
export const TextualSummary: React.FunctionComponent<Props> = props =>
  chooseTextualInfoBox(props);
