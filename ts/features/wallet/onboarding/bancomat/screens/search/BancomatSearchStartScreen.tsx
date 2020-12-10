import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { Content } from "native-base";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import TosBonusComponent from "../../../../../bonus/bonusVacanze/components/TosBonusComponent";
import { isError, isLoading } from "../../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../../store/abi";
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
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { BancomatSearchStartComponent } from "./BancomatSearchStartComponent";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const tos_url = "https://io.italia.it/app-content/privacy_bancomat.html";

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
 * @constructor
 */
const BancomatSearchStartScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent tos_url={tos_url} onClose={props.hideModal} />
    );
  };

  const onContinueHandler = () => {
    props.searchPans();
  };
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.searchAbi.header")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          <BancomatSearchStartComponent
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
  isError: isError(abiSelector(state))
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(BancomatSearchStartScreen)
);
