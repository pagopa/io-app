import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import TosBonusComponent from "../../../../../bonus/bonusVacanze/components/TosBonusComponent";
import { isError, isLoading } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiListSelector, abiSelector } from "../../../store/abi";
import { navigateToOnboardingBancomatSearchAvailableUserBancomat } from "../../navigation/action";
import {
  loadAbi,
  searchUserPans,
  walletAddBancomatBack,
  walletAddBancomatCancel
} from "../../store/actions";
import { SearchBankComponent } from "./SearchBankComponent";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * the user can also choose not to specify any bank and search for all Bancomat in his name
 * @constructor
 */
const SearchBankScreen: React.FunctionComponent<Props> = (props: Props) => {
  React.useEffect(() => {
    props.loadAbis();
  }, []);

  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent
        tos_url={"https://google.com"}
        onClose={props.hideModal}
      />
    );
  };

  return (
    <BaseScreenComponent
      goBack={props.onBack}
      headerTitle={I18n.t("wallet.searchAbi.title")}
    >
      <SearchBankComponent
        bankList={props.bankList}
        isLoading={props.isLoading}
        onCancel={props.onCancel}
        onContinue={props.searchPans}
        onItemPress={props.searchPans}
        openTosModal={openTosModal}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbis: () => dispatch(loadAbi.request()),
  onCancel: () => dispatch(walletAddBancomatCancel()),
  onBack: () => dispatch(walletAddBancomatBack()),
  searchPans: (abi?: string) => {
    dispatch(searchUserPans.request(abi));
    dispatch(navigateToOnboardingBancomatSearchAvailableUserBancomat());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)) || isError(abiSelector(state)),
  bankList: abiListSelector(state)
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(SearchBankScreen)
);
