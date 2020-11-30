import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Timeout during the satispay account request
 * @constructor
 */
const SatispayKoTimeout: React.FunctionComponent<Props> = () => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SatispayKoTimeout);
