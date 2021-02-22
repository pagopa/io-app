import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { GlobalState } from "../../store/reducers/types";
import { lastPaymentOutcomeCodeSelector } from "../../store/reducers/wallet/outcomeCode";
import { navigateToWalletHome } from "../../store/actions/navigation";
import OutcomeCodeMessageComponent from "../../components/wallet/OutcomeCodeMessageComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
const AddCreditCardOutcomeCodeMessage: React.FC<Props> = (props: Props) => {
  const outcomeCode = pot.isSome(props.outcomeCode.outcomeCode)
    ? props.outcomeCode.outcomeCode.value
    : false;

  return outcomeCode ? (
    <OutcomeCodeMessageComponent
      outcomeCode={outcomeCode}
      onClose={props.navigateToWalletHome}
      onSuccess={() => true}
      flow="addCreditCard"
    />
  ) : null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome())
});

const mapStateToProps = (state: GlobalState) => ({
  outcomeCode: lastPaymentOutcomeCodeSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddCreditCardOutcomeCodeMessage);
