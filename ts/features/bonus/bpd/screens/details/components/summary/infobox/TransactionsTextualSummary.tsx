import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { InfoBox } from "../../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../../components/core/typography/Body";
import { BpdPeriodStatus } from "../../../../../store/actions/periods";
import I18n from "../../../../../../../../i18n";

type Props = {
  // the number of transactions executed in the period
  transactions: number;
  // the number of minimum transactions required in the period to earn the cashback value
  minTransactions: number;
  // the amount of cashback earned
  cashbackAmount: number;
  // the max amount of cashback that can be earned in the period
  maxPeriodCashback: number;
  // the user name
  name: string;
  // the period status
  periodStatus: BpdPeriodStatus;
};

const styles = StyleSheet.create({});

/**
 * Display a warning for the current period if transactions < minTransaction and status === "Active"
 */
const CurrentPeriodWarning = () => (
  <InfoBox>
    <Body>
      {I18n.t(
        "bonus.bpd.details.components.transactionsCountOverview.currentPeriodKOBody"
      )}
    </Body>
  </InfoBox>
);

const chooseTextualInfoBox = (props: Props) => {
  if (
    props.periodStatus === "Active" &&
    props.transactions < props.minTransactions
  ) {
    return <CurrentPeriodWarning />;
  }

  return null;
};

export const MinimumTransactionsTextualInfoBox: React.FunctionComponent<Props> = props =>
  chooseTextualInfoBox(props);
