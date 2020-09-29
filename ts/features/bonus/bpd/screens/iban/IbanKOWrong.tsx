import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";

/**
 * This screen informs the user that the provided iban is not right and cannot continue.
 * @constructor
 */
export const IbanKoWrong: React.FunctionComponent = () => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IbanKoWrong);
