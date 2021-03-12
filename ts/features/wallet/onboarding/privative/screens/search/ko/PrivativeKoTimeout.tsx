import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../../store/reducers/types";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

/**
 * This screen informs the user that a timeout is occurred while searching the indicated privative card.
 * The timeout can be:
 * - A networking timeout
 * - An application center which send a pending response
 * @param props
 * @constructor
 */
const PrivativeKoTimeout = (_: Props): React.ReactElement => <View />;

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PrivativeKoTimeout);
