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
  isReady,
  isUndefined
} from "../../../../../bonus/bpd/model/RemoteValue";
import { abiListSelector, abiSelector } from "../../../store/abi";
import { navigateToOnboardingBancomatSearchAvailableUserBancomat } from "../../navigation/action";
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
import { onboardingBancomatFoundPansSelector } from "../../store/reducers/pans";
import { SearchBankComponent } from "./SearchBankComponent";
import { SearchBankInfo } from "./SearchBankInfo";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const renderFooterButtons = (
  isSearchStarted: boolean,
  onCancel: () => void,
  onContinue: () => void,
  onClose: () => void
) =>
  !isSearchStarted ? (
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      leftButton={cancelButtonProps(onCancel, I18n.t("global.buttons.cancel"))}
      rightButton={confirmButtonProps(
        onContinue,
        I18n.t("global.buttons.continue")
      )}
    />
  ) : (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={cancelButtonProps(onClose, I18n.t("global.buttons.close"))}
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

  // After the press on "Continue", one of the ca returned with error, the user could have a bancomat
  // and he should try to search for a single bank
  const pans = props.pans;
  const noBancomatFound = isReady(pans) && pans.value.cards.length === 0;

  const [isSearchStarted, setIsSearchStarted] = React.useState(noBancomatFound);

  React.useEffect(() => {
    reactotron.log("entra");
    setIsSearchStarted(isReady(pans) && pans.value.cards.length === 0);
  }, [props.pans]);

  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent
        tos_url={"https://io.italia.it/app-content/privacy_bancomat.html"}
        onClose={props.hideModal}
      />
    );
  };

  const onBackHandler = () =>
    isSearchStarted ? setIsSearchStarted(false) : props.onBack();

  const onContinueHandler = () => {
    props.searchPans();
  };
  const onCloseHandler = () => {
    setIsSearchStarted(false);
  };
  return (
    <BaseScreenComponent
      goBack={onBackHandler}
      headerTitle={I18n.t("wallet.searchAbi.title")}
      contextualHelp={emptyContextualHelp}
    >
      <NavigationEvents onDidBlur={() => clearTimeout(errorRetry)} />
      <SafeAreaView style={{ flex: 1 }}>
        <Content style={{ flex: 1 }}>
          {!isSearchStarted ? (
            <SearchBankInfo
              openTosModal={openTosModal}
              onSearch={() => {
                setIsSearchStarted(true);
              }}
            />
          ) : (
            <SearchBankComponent
              bankList={props.bankList}
              isLoading={props.isLoading || props.isError}
              onItemPress={props.searchPans}
            />
          )}
        </Content>
        {renderFooterButtons(
          isSearchStarted,
          props.onCancel,
          onContinueHandler,
          onCloseHandler
        )}
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
  }
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state)),
  bankList: abiListSelector(state),
  bankRemoveValue: abiSelector(state),
  pans: onboardingBancomatFoundPansSelector(state)
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(SearchBankInfoScreen)
);
