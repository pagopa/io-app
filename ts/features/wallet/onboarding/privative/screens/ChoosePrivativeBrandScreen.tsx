import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
/**
 * The user will choose a brand between a list of available brands
 * This screen handles also the loading and error of the brands configuration
 * TODO: add loading and error screen
 * @param props
 * @constructor
 */
const ChoosePrivativeBrandScreen = (_: Props): React.ReactElement => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChoosePrivativeBrandScreen);
