import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H2 } from "../../../../../../../components/core/typography/H2";
import { H5 } from "../../../../../../../components/core/typography/H5";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { BpdBaseShadowBoxLayout } from "./base/BpdBaseShadowBoxLayout";

const loadLocales = () => ({
  title: I18n.t("bonus.bpd.details.components.ranking.title"),
  of: I18n.t("bonus.bpd.details.components.transactionsCountOverview.of")
});

const styles = StyleSheet.create({
  title: {
    textAlign: "center"
  }
});

type OwnProps = {
  ranking: number;
  minRanking: number;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const SuperCashbackRankingSummary: React.FunctionComponent<Props> = props => {
  const { title, of } = loadLocales();
  return (
    <BpdBaseShadowBoxLayout
      row1={
        <H5 testID={"supercashbackSummary.title"} style={styles.title}>
          {title}
        </H5>
      }
      row2={
        <H2 color={"blue"} style={styles.title}>
          {props.ranking}°
        </H2>
      }
      row3={
        <H5 color={"bluegrey"} style={styles.title}>
          {of} {props.minRanking}
        </H5>
      }
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SuperCashbackRankingSummary);
