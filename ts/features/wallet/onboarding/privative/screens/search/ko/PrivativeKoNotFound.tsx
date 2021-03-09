import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen informs the user that the private card indicated was not found
 * @param props
 * @constructor
 */
const PrivativeKoNotFound = (_: Props): React.ReactElement => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeKoNotFound);
