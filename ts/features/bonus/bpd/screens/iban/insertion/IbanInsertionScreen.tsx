import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue,
  bpdUpsertIban
} from "../../../store/actions/iban";
import { IbanInsertionComponent } from "./IbanInsertionComponent";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to add / modify an iban to be used to receive the refund provided by bpd
 * @constructor
 */
const IbanInsertionScreen: React.FunctionComponent<Props> = props => (
  <IbanInsertionComponent
    onBack={props.cancel}
    onContinue={props.continue}
    onIbanConfirm={props.submitIban}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(bpdIbanInsertionCancel()),
  continue: () => dispatch(bpdIbanInsertionContinue()),
  submitIban: (iban: Iban) => dispatch(bpdUpsertIban.request(iban))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IbanInsertionScreen);
