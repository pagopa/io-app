import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useContext } from "react";
import { LightModalContext } from "../../../../../../components/ui/LightModal";
import { GlobalState } from "../../../../../../store/reducers/types";
import TosBonusComponent from "../../../../../bonus/common/components/TosBonusComponent";
import {
  navigateToOnboardingBancomatChooseBank,
  navigateToOnboardingBancomatSearchAvailableUserBancomat
} from "../../navigation/action";
import { searchUserPans, walletAddBancomatCancel } from "../../store/actions";
import SearchStartScreen from "../../../common/searchBank/SearchStartScreen";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const tos_url = "https://io.italia.it/app-content/privacy_bancomat.html";

/**
 * This screen allows the user to choose a specific bank to search for their BPay Accounts.
 * @constructor
 */
const BancomatSearchStartScreen = (props: Props): React.ReactElement => {
  const { showModal, hideModal } = useContext(LightModalContext);

  const openTosModal = () => {
    showModal(<TosBonusComponent tos_url={tos_url} onClose={hideModal} />);
  };

  return (
    <SearchStartScreen
      methodType={"bancomat"}
      onCancel={props.onCancel}
      onSearch={props.searchPans}
      handleTosModal={openTosModal}
      navigateToSearchBank={props.navigateToSearchBankScreen}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(walletAddBancomatCancel()),
  searchPans: (abi?: string) => {
    dispatch(searchUserPans.request(abi));
    navigateToOnboardingBancomatSearchAvailableUserBancomat();
  },
  navigateToSearchBankScreen: () => {
    navigateToOnboardingBancomatChooseBank();
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatSearchStartScreen);
