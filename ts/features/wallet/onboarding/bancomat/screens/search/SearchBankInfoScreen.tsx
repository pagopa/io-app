import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { NavigationEvents } from "react-navigation";
import { SafeAreaView } from "react-native";
import { Content } from "native-base";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import TosBonusComponent from "../../../../../bonus/bonusVacanze/components/TosBonusComponent";
import {
  isError,
  isLoading,
  isUndefined
} from "../../../../../bonus/bpd/model/RemoteValue";
import { abiListSelector, abiSelector } from "../../../store/abi";
import {
  navigateToOnboardingBancomatChooseBank,
  navigateToOnboardingBancomatSearchAvailableUserBancomat
} from "../../navigation/action";
import {
  loadAbi,
  searchUserPans,
  walletAddBancomatBack,
  walletAddBancomatCancel
} from "../../store/actions";
import { fetchPagoPaTimeout } from "../../../../../../config";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { SearchBankInfoComponent } from "./SearchBankInfoComponent";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const renderFooterButtons = (onCancel: () => void, onContinue: () => void) => (
  <FooterWithButtons
    type={"TwoButtonsInlineThird"}
    leftButton={cancelButtonProps(onCancel, I18n.t("global.buttons.cancel"))}
    rightButton={confirmButtonProps(
      onContinue,
      I18n.t("global.buttons.continue")
    )}
  />
);

/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * the user can also choose not to specify any bank and search for all Bancomat in his name
 * @constructor
 */
const SearchBankInfoScreen: React.FunctionComponent<Props> = (props: Props) => {
  // eslint-disable-next-line functional/no-let
  let errorRetry: number | undefined;
  React.useEffect(() => {
    if (isUndefined(props.bankRemoveValue)) {
      props.loadAbis();
    } else if (isError(props.bankRemoveValue)) {
      errorRetry = setTimeout(props.loadAbis, fetchPagoPaTimeout);
    }
  }, [props.bankRemoveValue]);

  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent
        tos_url={"https://io.italia.it/app-content/privacy_bancomat.html"}
        onClose={props.hideModal}
      />
    );
  };

  const onContinueHandler = () => {
    props.searchPans();
  };
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.searchAbi.title")}
      contextualHelp={emptyContextualHelp}
    >
      <NavigationEvents onDidBlur={() => clearTimeout(errorRetry)} />
      <SafeAreaView style={{ flex: 1 }}>
        <Content style={{ flex: 1 }}>
          <SearchBankInfoComponent
            openTosModal={openTosModal}
            onSearch={props.navigateToSearchBankScreen}
          />
        </Content>
        {renderFooterButtons(props.onCancel, onContinueHandler)}
      </SafeAreaView>
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
  },
  navigateToSearchBankScreen: () => {
    dispatch(navigateToOnboardingBancomatChooseBank());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state)),
  bankList: abiListSelector(state),
  bankRemoveValue: abiSelector(state)
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(SearchBankInfoScreen)
);
