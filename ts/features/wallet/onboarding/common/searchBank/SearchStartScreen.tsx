import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { Content } from "native-base";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { WithTestID } from "../../../../../types/WithTestID";
import { isError, isLoading } from "../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../store/abi";
import { loadAbi } from "../../bancomat/store/actions";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import SectionStatusComponent from "../../../../../components/SectionStatus";
import { SectionStatusKey } from "../../../../../store/reducers/backendStatus";
import { SearchStartComponent } from "./SearchStartComponent";

type MethodType = "bancomatPay" | "bancomat" | "cobadge";

type Props = WithTestID<{
  methodType: MethodType;
  onSearch: (abi?: string) => void;
  navigateToSearchBank?: () => void;
  onCancel: () => void;
  handleTosModal: () => void;
  handleParticipatingBanksModal?: () => void;
  bankName?: string;
}> &
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

const handleMethodName = (methodType: MethodType) => {
  switch (methodType) {
    case "bancomatPay":
      return I18n.t("wallet.methods.bancomatPay.name");
    case "bancomat":
      return I18n.t("wallet.methods.pagobancomat.name");
    case "cobadge":
      return I18n.t("wallet.methods.cobadge.name");
  }
};

const getSectionName = (methodType: MethodType): SectionStatusKey => {
  switch (methodType) {
    case "bancomat":
      return "bancomat";
    case "bancomatPay":
      return "bancomatpay";
    case "cobadge":
      return "cobadge";
  }
};

/**
 * This is the component that defines the base screen for the main screen to start the funnel
 * to search for a user PagoBANCOMAT / BPay account.
 * @constructor
 */
const SearchStartScreen: React.FunctionComponent<Props> = (props: Props) => {
  const onContinueHandler = () => {
    props.onSearch();
  };
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.searchAbi.header", {
        methodName: handleMethodName(props.methodType)
      })}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={props.testID}>
        <Content style={IOStyles.flex}>
          <SearchStartComponent
            openTosModal={props.handleTosModal}
            onSearch={props.navigateToSearchBank}
            methodType={props.methodType}
            bankName={props.bankName}
            openParticipatingBanksModal={props.handleParticipatingBanksModal}
            showCircuitLogo={props.methodType === "cobadge"}
          />
        </Content>
        <SectionStatusComponent sectionKey={getSectionName(props.methodType)} />
        {renderFooterButtons(props.onCancel, onContinueHandler)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbis: () => dispatch(loadAbi.request())
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state))
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchStartScreen);
