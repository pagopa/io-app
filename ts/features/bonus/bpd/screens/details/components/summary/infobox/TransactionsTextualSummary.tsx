import * as React from "react";
import { StyleSheet } from "react-native";
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

const styles = StyleSheet.create({});

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
      {props.amount.totalCashback >= props.period.maxPeriodCashback
        ? ": " +
          I18n.t(
            "bonus.bpd.details.components.transactionsCountOverview.closedPeriodMaxAmount"
          )
        : "!"}
    </Body>
  </InfoBox>
);

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

const chooseTextualInfoBox = (props: Props) => {
  if (
    props.period.status === "Active" &&
    props.amount.transactionNumber < props.period.minTransactionNumber
  ) {
    return <CurrentPeriodWarning period={props.period} />;
  }
  if (props.period.status === "Closed") {
    const today = new Date();
    const endGracePeriod = new Date();
    endGracePeriod.setDate(
      props.period.endDate.getDate() + props.period.gracePeriod
    );
    if (today <= endGracePeriod) {
      return <GracePeriod {...props} />;
    }
    if (props.amount.transactionNumber < props.period.minTransactionNumber) {
      return <ClosedPeriodKO {...props} />;
    }
    return <ClosedPeriodOK {...props} />;
  }
  return null;
};

export const TransactionsTextualSummary: React.FunctionComponent<Props> = props =>
  chooseTextualInfoBox(props);
