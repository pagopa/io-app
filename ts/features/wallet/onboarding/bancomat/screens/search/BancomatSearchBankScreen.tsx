import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { navigateToOnboardingBancomatSearchAvailableUserBancomat } from "../../navigation/action";
import { searchUserPans } from "../../store/actions";
import SearchBankScreen from "../../../common/searchBank/SearchBankScreen";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * @constructor
 */
const BancomatSearchBankScreen: React.FunctionComponent<Props> = (
  props: Props
) => (
  <SearchBankScreen onItemPress={props.searchPans} methodType={"bancomat"} />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  searchPans: (abi?: string) => {
    dispatch(searchUserPans.request(abi));
    navigateToOnboardingBancomatSearchAvailableUserBancomat();
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatSearchBankScreen);
