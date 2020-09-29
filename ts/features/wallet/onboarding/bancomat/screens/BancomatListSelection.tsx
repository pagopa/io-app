import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";

/**
 * This screen shows the bancomat found for the user and allows him to choose
 * which of these he wants to onboard.
 * @constructor
 */
export const BancomatListSelection: React.FunctionComponent = () => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatListSelection);
