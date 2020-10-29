import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { H1 } from "../../../../../components/core/typography/H1";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#AAFFFF66",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

/**
 * An horizontal snap scroll view used to select a specific period of bpd.
 * Each period is represented as a BpdPeriodCard
 * @constructor
 */
const BpdPeriodSelector: React.FunctionComponent<Props> = () => (
  <View style={styles.main}>
    <H1>Period selector placeholder!</H1>
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdPeriodSelector);
