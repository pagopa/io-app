import * as React from "react";
import { useContext } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import { LightModalContext } from "../../../../../../components/ui/LightModal";
import { GlobalState } from "../../../../../../store/reducers/types";
import TosBonusComponent from "../../../../../bonus/bonusVacanze/components/TosBonusComponent";
import SearchStartScreen from "../../../common/searchBank/SearchStartScreen";
import { abiListSelector } from "../../../store/abi";
import { navigateToOnboardingCoBadgeSearchAvailable } from "../../navigation/action";
import { searchUserCoBadge, walletAddCoBadgeCancel } from "../../store/actions";

type OwnProps = {
  abi: string;
};
type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const tos_url =
  "https://io.italia.it/app-content/privacy_circuiti_internazionali.html";
const partecipatingBank_url =
  "https://io.italia.it/app-content/privacy_circuiti_internazionali.html";
/**
 * The initial screen of the co-badge workflow (starting with a specific ABI, eg. from BANCOMAT screen)
 * The user can see the selected bank and can start the search for all the co-badge for the specific bank.
 * @param _
 * @constructor
 */
const CoBadgeSingleBankScreen = (props: Props): React.ReactElement => {
  const { showModal, hideModal } = useContext(LightModalContext);

  const openTosModal = () => {
    showModal(<TosBonusComponent tos_url={tos_url} onClose={hideModal} />);
  };

  const openPartecipatingBankModal = () => {
    showModal(
      <TosBonusComponent tos_url={partecipatingBank_url} onClose={hideModal} />
    );
  };

  const abiInfo: Abi | undefined = props.abiList.find(
    aI => aI.abi === props.abi
  );
  return (
    <SearchStartScreen
      methodType={"cobadge"}
      onCancel={props.onCancel}
      onSearch={props.searchAccounts}
      handlePartecipatingBanksModal={openPartecipatingBankModal}
      handleTosModal={openTosModal}
      bankName={abiInfo?.name}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(walletAddCoBadgeCancel()),
  searchAccounts: (abi?: string) => {
    dispatch(searchUserCoBadge.request(abi));
    dispatch(navigateToOnboardingCoBadgeSearchAvailable());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  abiList: abiListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeSingleBankScreen);
