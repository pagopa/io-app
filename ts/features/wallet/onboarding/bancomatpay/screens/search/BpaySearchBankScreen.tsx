import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import SearchBankScreen from "../../../common/searchBank/SearchBankScreen";
import I18n from "../../../../../../i18n";
import { searchUserPans } from "../../../bancomat/store/actions";
import { navigateToOnboardingBancomatSearchAvailableUserBancomat } from "../../../bancomat/navigation/action";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * @constructor
 */
const BpaySearchBankScreen: React.FunctionComponent<Props> = (props: Props) => (
  <SearchBankScreen
    onItemPress={props.searchAccounts}
    methodName={I18n.t("wallet.methods.bancomatPay.name")}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO Replace with bpay specific
  searchAccounts: (abi?: string) => {
    dispatch(searchUserPans.request(abi));
    dispatch(navigateToOnboardingBancomatSearchAvailableUserBancomat());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpaySearchBankScreen);
