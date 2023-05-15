import * as React from "react";
import { View, StyleSheet } from "react-native";
import I18n from "../../../../i18n";
import { H3 } from "../../../../components/core/typography/H3";
import { H5 } from "../../../../components/core/typography/H5";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { formatIntegerNumber } from "../../../../utils/stringBuilder";
import { Icon } from "../../../../components/core/icons";

type Props = {
  date: string;
  transactionsNumber: number;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  container: {
    justifyContent: "space-between"
  },
  whiteBg: {
    backgroundColor: IOColors.white
  }
});

const BaseDailyTransactionHeader: React.FunctionComponent<Props> = (
  props: Props
) => (
  <View
    style={[styles.whiteBg, { paddingHorizontal: 24 }]}
    testID={"BaseDailyTransactionHeader"}
  >
    <H3 weight={"Bold"} color={"black"}>
      {props.date}
    </H3>
    <View style={[styles.row, styles.container]}>
      <View style={styles.row}>
        <Icon name="transactions" size={12} color="bluegrey" />
        <H5 color={"bluegrey"}>
          {` ${I18n.t(
            "bonus.bpd.details.components.transactionsCountOverview.label",
            {
              defaultValue: I18n.t(
                "bonus.bpd.details.components.transactionsCountOverview.label.other",
                {
                  transactions: formatIntegerNumber(props.transactionsNumber)
                }
              ),
              count: props.transactionsNumber,
              transactions: formatIntegerNumber(props.transactionsNumber)
            }
          )}`}
        </H5>
      </View>
      <H5 color={"bluegrey"}>{`${I18n.t("bonus.bpd.name")} (€)`} </H5>
    </View>
  </View>
);

export default BaseDailyTransactionHeader;
