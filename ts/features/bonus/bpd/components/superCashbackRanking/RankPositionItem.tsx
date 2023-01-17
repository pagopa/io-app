import * as React from "react";
import { Badge, Text as NBText } from "native-base";
import { View, Platform, StyleSheet } from "react-native";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { H5 } from "../../../../../components/core/typography/H5";
import { H4 } from "../../../../../components/core/typography/H4";
import {
  formatIntegerNumber,
  formatNumberWithNoDigits
} from "../../../../../utils/stringBuilder";
import I18n from "../../../../../i18n";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";

type Props = {
  transactionsNumber: number;
  superCashbackAmount: number;
  boxedLabel: string;
  rankingLabel: string;
  currentUserPosition?: boolean;
  hideBadge?: boolean;
};

const style = StyleSheet.create({
  positionBox: {
    paddingVertical: 8,
    width: 48,
    textAlign: "center"
  },
  badgeBlue: {
    backgroundColor: IOColors.blue,
    height: 18,
    marginTop: 4
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 18,
    color: IOColors.white,
    marginBottom: Platform.select({ android: 2, default: 0 })
  }
});

const RankPositionItem = (props: Props): React.ReactElement => (
  <>
    <View style={[IOStyles.row, IOStyles.flex]}>
      <View
        style={[
          style.positionBox,
          {
            backgroundColor: props.currentUserPosition
              ? IOColors.blue
              : IOColors.greyLight
          }
        ]}
        testID={"PositionBoxContainer"}
      >
        <H4
          color={props.currentUserPosition ? "white" : "bluegreyDark"}
          style={{ textAlign: "center", lineHeight: 30 }}
          testID={"PositionBoxedLabel"}
        >
          {props.boxedLabel}
        </H4>
      </View>
      <HSpacer size={16} />
      <View style={IOStyles.flex}>
        <View style={[IOStyles.row, { justifyContent: "space-between" }]}>
          <H4 testID={"RankingLabel"}>{props.rankingLabel}</H4>
          {!props.hideBadge && (
            <Badge style={style.badgeBlue} testID={"SuperCashbackAmountBadge"}>
              <NBText style={style.badgeText} semibold={true}>
                {formatNumberWithNoDigits(props.superCashbackAmount, true)}
              </NBText>
            </Badge>
          )}
        </View>
        <H5 testID={"RankingTransactions"}>
          {I18n.t("bonus.bpd.details.transaction.label", {
            defaultValue: I18n.t("bonus.bpd.details.transaction.label.other", {
              transactions: formatIntegerNumber(props.transactionsNumber)
            }),
            count: props.transactionsNumber,
            transactions: formatIntegerNumber(props.transactionsNumber)
          })}
        </H5>
      </View>
    </View>
    <VSpacer size={16} />
  </>
);

export default RankPositionItem;
