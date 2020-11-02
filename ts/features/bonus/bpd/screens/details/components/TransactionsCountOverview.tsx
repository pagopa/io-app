import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { H2 } from "../../../../../../components/core/typography/H2";
import { H5 } from "../../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../i18n";

type Props = {
  transactions: number;
  minTransactions: number;
};

const styles = StyleSheet.create({
  body: {
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#00274e",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  title: {
    textAlign: "center"
  },
  progressBar: {
    backgroundColor: IOColors.greyLight,
    height: 4
  },
  fillBar: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: IOColors.blue
  }
});

/**
 * Display the the transactions made by the user
 * vs the transactions necessary to receive the cashback in the period.
 * @param props
 * @constructor
 */
export const TransactionsCountOverview: React.FunctionComponent<Props> = props => {
  const percentageValue = (props.transactions / props.minTransactions) * 100;
  // in order to fill the first amount of the bar, if there are 0 transactions,
  // the percentage is set to 1
  const transactionPercentage = `${
    percentageValue === 0 ? 1 : percentageValue
  }%`;
  return (
    <View style={styles.body}>
      <View style={styles.container}>
        <H5 style={styles.title}>
          {I18n.t(
            "bonus.bpd.details.components.transactionsCountOverview.title"
          )}
        </H5>
        <H2 style={styles.title}>0 su 50</H2>
        <View spacer={true} small={true} />
        <View style={styles.progressBar}>
          <View style={[styles.fillBar, { width: transactionPercentage }]} />
        </View>
      </View>
    </View>
  );
};
