import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";

/**
 * This screen warns the user that the provided iban does not belong to him.
 * This is just a warning, the user can continue and iban has been registered on the bpd remote system.
 * @constructor
 */
export const IbanKoNotOwned: React.FunctionComponent = () => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IbanKoNotOwned);
