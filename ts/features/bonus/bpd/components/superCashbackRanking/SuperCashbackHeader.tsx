import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, Text as NBText } from "native-base";
import * as React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { BpdPeriodWithInfo } from "../../store/reducers/details/periods";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";

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
  pipe(
    period,
    O.fromNullable,
    O.fold(
      () => false,
      p => {
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
      }
    )
  );

const SuperCashbackHeader: React.FunctionComponent<Props> = (props: Props) => (
  <View style={[IOStyles.row, { alignItems: "center" }]}>
    {isPeriodOnGoing(props.selectedPeriod) && (
      <Badge style={styles.badgeAqua}>
        <NBText style={styles.badgeText} semibold={true}>
          {I18n.t("global.badges.onGoing")}
        </NBText>
      </Badge>
    )}
    <HSpacer size={16} />
    <H3>{I18n.t("bonus.bpd.details.superCashback.rankTitle")}</H3>
  </View>
);

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps)(SuperCashbackHeader);
