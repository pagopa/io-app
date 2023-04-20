import * as React from "react";
import { useContext } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import { LightModalContext } from "../../../../../../components/ui/LightModal";
import { GlobalState } from "../../../../../../store/reducers/types";
import { WithTestID } from "../../../../../../types/WithTestID";
import TosBonusComponent from "../../../../../bonus/common/components/TosBonusComponent";
import SearchStartScreen from "../../../common/searchBank/SearchStartScreen";
import { abiListSelector, abiSelector } from "../../../store/abi";
import { navigateToOnboardingCoBadgeSearchAvailable } from "../../navigation/action";
import {
  walletAddCoBadgeCancel,
  walletAddCoBadgeFailure
} from "../../store/actions";
import { fold, isReady } from "../../../../../bonus/bpd/model/RemoteValue";
import { loadAbi } from "../../../bancomat/store/actions";
import I18n from "../../../../../../i18n";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { mixpanelTrack } from "../../../../../../mixpanel";

type OwnProps = {
  abi?: string;
};
type Props = WithTestID<OwnProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const tos_url =
  "https://io.italia.it/app-content/privacy_circuiti_internazionali.html";

const participatingBank_url =
  "https://io.italia.it/cashback/carta-non-abilitata-pagamenti-online";

const abiListLoadingError = (
  isLoading: boolean,
  onAbort: () => void,
  onRetry: () => void
) => (
  <LoadingErrorComponent
    testID={"abiListLoadingError"}
    isLoading={isLoading}
    loadingCaption={I18n.t("wallet.onboarding.coBadge.start.loading")}
    onAbort={onAbort}
    onRetry={onRetry}
  />
);

/**
 * The initial screen of the co-badge workflow (starting with a specific ABI, eg. from BANCOMAT screen)
 * The user can see the selected bank and can start the search for all the co-badge for the specific bank.
 * @constructor
 * @param props
 */
const CoBadgeChosenBankScreen = (props: Props): React.ReactElement | null => {
  const { showModal, hideModal } = useContext(LightModalContext);
  const { abiListStatus, loadAbiList } = props;

  React.useEffect(() => {
    fold(
      abiListStatus,
      () => loadAbiList(),
      () => null,
      _ => null,
      _ => loadAbiList()
    );
  }, [abiListStatus, loadAbiList]);

  const openTosModal = () => {
    showModal(<TosBonusComponent tos_url={tos_url} onClose={hideModal} />);
  };

  const openPartecipatingBankModal = () => {
    showModal(
      <TosBonusComponent tos_url={participatingBank_url} onClose={hideModal} />
    );
  };

  const abiInfo: Abi | undefined = props.abiList.find(
    aI => aI.abi === props.abi
  );

  if (
    abiInfo === undefined &&
    props.abi !== undefined &&
    isReady(props.abiListStatus)
  ) {
    props.onGeneralError("Abi not found in abilist in CoBadgeChosenBankScreen");
    void mixpanelTrack("COBADGE_CHOSEN_BANK_SCREEN_ABI_NOT_FOUND", {
      issuerAbiCode: props.abi
    });
    return null;
  }

  return fold(
    props.abiListStatus,
    () => abiListLoadingError(false, props.onCancel, props.loadAbiList),
    () => abiListLoadingError(true, props.onCancel, props.loadAbiList),
    _ => (
      <SearchStartScreen
        testID={props.testID}
        methodType={"cobadge"}
        onCancel={props.onCancel}
        onSearch={props.searchAccounts}
        handleParticipatingBanksModal={openPartecipatingBankModal}
        handleTosModal={openTosModal}
        bankName={abiInfo?.name}
      />
    ),
    _ => abiListLoadingError(false, props.onCancel, props.loadAbiList)
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(walletAddCoBadgeCancel()),
  searchAccounts: () => navigateToOnboardingCoBadgeSearchAvailable(),
  loadAbiList: () => dispatch(loadAbi.request()),
  onGeneralError: (reason: string) => dispatch(walletAddCoBadgeFailure(reason))
});

const mapStateToProps = (state: GlobalState) => ({
  abiListStatus: abiSelector(state),
  abiList: abiListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeChosenBankScreen);
