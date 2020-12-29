import * as React from "react";
import { connect } from "react-redux";
import { Badge, Text, View } from "native-base";
import { StyleSheet, Platform } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { BpdPeriodWithInfo } from "../../store/reducers/details/periods";
import I18n from "../../../../../i18n";
import { H3 } from "../../../../../components/core/typography/H3";

type Props = ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  badgeAqua: {
    backgroundColor: IOColors.aqua,
    height: 18,
    marginTop: 5
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Platform.select({ android: 2, default: 0 }),
    color: IOColors.bluegreyDark
  }
});

const isPeriodOnGoing = (period: BpdPeriodWithInfo | undefined) =>
  fromNullable(period).fold(false, p => {
    if (p.status !== "Closed") {
      return true;
    }

    const actualDate = new Date();
    const endDate = new Date(p.endDate.getTime());
    endDate.setDate(endDate.getDate() + p.gracePeriod);

    return (
      actualDate.getTime() >= p.endDate.getTime() &&
      actualDate.getTime() <= endDate.getTime()
    );
  });

const SuperCashbackHeader: React.FunctionComponent<Props> = (props: Props) => (
  <View style={[IOStyles.row, { alignItems: "center" }]}>
    {isPeriodOnGoing(props.selectedPeriod) && (
      <Badge style={styles.badgeAqua}>
        <Text style={styles.badgeText} semibold={true}>
          {I18n.t("global.badges.onGoing")}
        </Text>
      </Badge>
    )}
    <View hspacer />
    <H3>{I18n.t("bonus.bpd.details.superCashback.rankTitle")}</H3>
  </View>
);

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps)(SuperCashbackHeader);
