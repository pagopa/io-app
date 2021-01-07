import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import { GlobalState } from "../../../../../../store/reducers/types";
import TosBonusComponent from "../../../../../bonus/bonusVacanze/components/TosBonusComponent";
import { isError, isLoading } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../store/abi";
import {
  navigateToOnboardingBancomatChooseBank,
  navigateToOnboardingBancomatSearchAvailableUserBancomat
} from "../../../bancomat/navigation/action";
import {
  searchUserPans,
  walletAddBancomatBack,
  walletAddBancomatCancel
} from "../../../bancomat/store/actions";
import SearchStartScreen from "../../../common/searchBank/SearchStartScreen";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// TODO Replace with BPAY specific if needed
const tos_url = "https://io.italia.it/app-content/privacy_bancomat.html";

/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * @constructor
 */
const BpaySearchStartScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent tos_url={tos_url} onClose={props.hideModal} />
    );
  };

  return (
    <SearchStartScreen
      methodName={"BANCOMAT Pay"}
      onCancel={props.onCancel}
      onSearch={props.searchAccounts}
      handleTosModal={openTosModal}
      navigateToSearchBank={props.navigateToSearchBankScreen}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(walletAddBancomatCancel()),
  onBack: () => dispatch(walletAddBancomatBack()),
  searchAccounts: (abi?: string) => {
    // TODO Replace Action with BPAY dedicated flow
    dispatch(searchUserPans.request(abi));
    dispatch(navigateToOnboardingBancomatSearchAvailableUserBancomat());
  },
  // TODO Replace Action with BPAY dedicated flow
  navigateToSearchBankScreen: () => {
    dispatch(navigateToOnboardingBancomatChooseBank());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state))
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(BpaySearchStartScreen)
);
