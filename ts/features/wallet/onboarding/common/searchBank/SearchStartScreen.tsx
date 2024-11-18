import { FooterWithButtons } from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { isError, isLoading } from "../../../../../common/model/RemoteValue";
import SectionStatusComponent from "../../../../../components/SectionStatus";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { SectionStatusKey } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { WithTestID } from "../../../../../types/WithTestID";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { loadAbi } from "../../bancomat/store/actions";
import { abiSelector } from "../../store/abi";
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
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          <SearchStartComponent
            openTosModal={props.handleTosModal}
            onSearch={props.navigateToSearchBank}
            methodType={props.methodType}
            bankName={props.bankName}
            openParticipatingBanksModal={props.handleParticipatingBanksModal}
            showCircuitLogo={props.methodType === "cobadge"}
          />
        </View>
        <SectionStatusComponent sectionKey={getSectionName(props.methodType)} />
      </SafeAreaView>
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: props.onCancel
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: onContinueHandler
          }
        }}
      />
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
