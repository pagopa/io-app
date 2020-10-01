import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";

/**
 * This screen warns the user that the provided iban cannot be verified.
 * This is just a warning, the user can continue and the iban has been registered on the bpd remote system.
 * @constructor
 */
export const IbanKoCannotVerify: React.FunctionComponent = () => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IbanKoCannotVerify);
