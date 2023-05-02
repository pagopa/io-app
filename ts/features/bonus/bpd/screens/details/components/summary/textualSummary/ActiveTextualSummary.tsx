import * as React from "react";
import { InfoBox } from "../../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../../components/core/typography/H4";
import I18n from "../../../../../../../../i18n";
import { formatNumberAmount } from "../../../../../../../../utils/stringBuilder";
import { BpdPeriod } from "../../../../../store/actions/periods";
import { isBpdRankingReady } from "../../../../../store/reducers/details/periods";
import { TextualSummary } from "./TextualSummary";

type Props = React.ComponentProps<typeof TextualSummary>;

/**
 * Display a warning for the current period if transactions < minTransaction and status === "Active"
 */
const Warning = (props: { period: BpdPeriod }) => (
  <InfoBox iconName="legLocked">
    <Body testID={"currentPeriodWarning"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodKOBody.one"
      )}
      <H4 color={"bluegreyDark"}>
        {I18n.t(
          "bonus.bpd.details.components.transactionsCountOverview.currentPeriodKOBody.two",
          {
            transactions: props.period.minTransactionNumber
          }
        )}
      </H4>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodKOBody.three"
      )}
    </Body>
  </InfoBox>
);

/**
 * Display a message informing the user that the cashback is unlocked for the current period
 */
const Unlock = (props: Props) => (
  <InfoBox iconName="legUnlocked">
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
const MaxAmount = (props: { name: string | undefined }) => (
  <InfoBox iconName="notice">
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
const SuperCashback = (props: { superCashbackAmount: number }) => (
  <InfoBox iconName="abacus">
    <Body testID={"currentPeriodSuperCashback"}>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodSuperCashback",
        { superCashbackAmount: formatNumberAmount(props.superCashbackAmount) }
      )}
    </Body>
  </InfoBox>
);

export const ActiveTextualSummary = (props: Props) => {
  // active period but still not enough transaction
  if (
    props.period.amount.transactionNumber < props.period.minTransactionNumber &&
    props.period.amount.totalCashback > 0
  ) {
    return <Warning period={props.period} />;
  }
  if (
    props.period.amount.transactionNumber >= props.period.minTransactionNumber
  ) {
    // The user is in the supercashback ranking atm
    if (
      isBpdRankingReady(props.period.ranking) &&
      props.period.ranking.ranking <= props.period.minPosition
    ) {
      return (
        <SuperCashback superCashbackAmount={props.period.superCashbackAmount} />
      );
    }
    // The max cashback amount is reached
    if (props.period.amount.totalCashback >= props.period.maxPeriodCashback) {
      return <MaxAmount name={props.name} />;
    }
    // Cashback unlocked! visible for the next 10 transaction only
    if (
      props.period.amount.transactionNumber <=
      props.period.minTransactionNumber + 10
    ) {
      return <Unlock {...props} />;
    }
  }
  return null;
};
