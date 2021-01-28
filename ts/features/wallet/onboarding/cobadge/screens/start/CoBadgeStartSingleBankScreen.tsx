import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * The initial screen of the co-badge workflow (starting with a specific ABI, eg. from BANCOMAT screen)
 * The user can see the selected bank and can start the search for all the co-badge for the specific bank.
 * @param _
 * @constructor
 */
const CoBadgeStartSingleBankScreen = (_: Props): React.ReactElement => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeStartSingleBankScreen);
