import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import SearchBankScreen from "../../../common/searchBank/SearchBankScreen";
import { searchUserBPay } from "../../store/actions";
import { navigateToOnboardingBPaySearchAvailableUserAccount } from "../../navigation/action";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * This screen allows the user to choose a specific bank to search for their BPay Account.
 * @constructor
 */
const BPaySearchBankScreen: React.FunctionComponent<Props> = (props: Props) => (
  <SearchBankScreen
    onItemPress={props.searchAccounts}
    methodType={"bancomatPay"}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  searchAccounts: (abi?: string) => {
    dispatch(searchUserBPay.request(abi));
    navigateToOnboardingBPaySearchAvailableUserAccount();
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BPaySearchBankScreen);
