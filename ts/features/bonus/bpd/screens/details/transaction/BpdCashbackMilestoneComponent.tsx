import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import fireworksIcon from "../../../../../../../img/bonus/bpd/fireworks.png";
import { formatNumberAmount } from "../../../../../../utils/stringBuilder";
import { H4 } from "../../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../i18n";

type Props = {
  cashbackValue: number;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: IOColors.blue,
    paddingVertical: 16
  },
  image: { width: 32, height: 32, resizeMode: "cover" },
  textPadding: {
    paddingHorizontal: 16
  }
});
const BpdCashbackMilestoneComponent: React.FunctionComponent<Props> = (
  props: Props
) => (
  <View style={[styles.container, IOStyles.horizontalContentPadding]}>
    <Image source={fireworksIcon} style={styles.image} />
    <View style={styles.textPadding}>
      <H4 color={"white"} weight={"SemiBold"}>
        {I18n.t(
          "bonus.bpd.details.transaction.detail.summary.milestone.title",
          { cashbackValue: formatNumberAmount(props.cashbackValue, true) }
        )}
      </H4>
      <H4 color={"white"} weight={"Regular"}>
        {I18n.t("bonus.bpd.details.transaction.detail.summary.milestone.body")}
      </H4>
    </View>
  </View>
);

export default BpdCashbackMilestoneComponent;
