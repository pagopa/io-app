import { Content } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import SectionStatusComponent from "../../../../../../components/SectionStatusComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { isError, isLoading } from "../../../../../bonus/bpd/model/RemoteValue";
import { loadAbi } from "../../../bancomat/store/actions";
import { abiSelector } from "../../../store/abi";
import {
  navigateToOnboardingBPayChooseBank,
  navigateToOnboardingBPaySearchAvailableUserAccount
} from "../../navigation/action";
import {
  searchUserBPay,
  walletAddBPayBack,
  walletAddBPayCancel
} from "../../store/actions";

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
 * This screen allows the user to choose a specific bank to search for their BPay accounts.
 * @constructor
 */
const BPaySearchStartScreen = (props: Props): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("wallet.searchAbi.header")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView style={IOStyles.flex}>
      <Content style={IOStyles.flex} />
      {renderFooterButtons(props.onCancel, props.searchBPay)}
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbis: () => dispatch(loadAbi.request()),
  onCancel: () => dispatch(walletAddBPayCancel()),
  onBack: () => dispatch(walletAddBPayBack()),
  searchBPay: (abi?: string) => {
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
