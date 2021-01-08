import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import { GlobalState } from "../../../../../../store/reducers/types";
import TosBonusComponent from "../../../../../bonus/bonusVacanze/components/TosBonusComponent";
import { isError, isLoading } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../store/abi";
import SearchStartScreen from "../../../common/searchBank/SearchStartScreen";
import {
  searchUserBPay,
  walletAddBPayBack,
  walletAddBPayCancel
} from "../../store/actions";
import {
  navigateToOnboardingBPayChooseBank,
  navigateToOnboardingBPaySearchAvailableUserAccount
} from "../../navigation/action";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const tos_url = "https://io.italia.it/app-content/privacy_bancomat.html";

/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * @constructor
 */
const BPaySearchStartScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent tos_url={tos_url} onClose={props.hideModal} />
    );
  };

  return (
    <SearchStartScreen
      methodType={"bancomatpay"}
      onCancel={props.onCancel}
      onSearch={props.searchAccounts}
      handleTosModal={openTosModal}
      navigateToSearchBank={props.navigateToSearchBankScreen}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(walletAddBPayCancel()),
  onBack: () => dispatch(walletAddBPayBack()),
  searchAccounts: (abi?: string) => {
    dispatch(searchUserBPay.request(abi));
    dispatch(navigateToOnboardingBPaySearchAvailableUserAccount());
  },
  navigateToSearchBankScreen: () => {
    dispatch(navigateToOnboardingBPayChooseBank());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state))
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(BPaySearchStartScreen)
);
