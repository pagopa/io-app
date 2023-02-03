import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View, FlatList, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { PspData } from "../../../../definitions/pagopa/PspData";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H1 } from "../../../components/core/typography/H1";
import { H4 } from "../../../components/core/typography/H4";
import { H5 } from "../../../components/core/typography/H5";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import { PspComponent } from "../../../components/wallet/payment/PspComponent";
import { cancelButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { LoadingErrorComponent } from "../../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  getValueOrElse,
  isError,
  isLoading
} from "../../../features/bonus/bpd/model/RemoteValue";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import { navigateBack } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { pspForPaymentV2 } from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { pspV2ListSelector } from "../../../store/reducers/wallet/payment";
import customVariables from "../../../theme/variables";
import { Wallet } from "../../../types/pagopa";
import { orderPspByAmount } from "../../../utils/payment";
import { showToast } from "../../../utils/showToast";
import { dispatchUpdatePspForWalletAndConfirm } from "./common";

export type PickPspScreenNavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
  psps: ReadonlyArray<PspData>;
  wallet: Wallet;
  chooseToChange?: boolean;
}>;

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "PAYMENT_PICK_PSP"
>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface &
  OwnProps;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  padded: { paddingHorizontal: customVariables.contentPadding }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.pickPsp.contextualHelpTitle",
  body: "wallet.pickPsp.contextualHelpContent"
};

/**
 * Select a PSP to be used for a the current selected wallet
 */
class PickPspScreen extends React.Component<Props> {
  public componentDidMount() {
    // load all psp in order to offer to the user the complete psps list
    const idWallet = this.props.route.params.wallet.idWallet;
    const idPayment = this.props.route.params.idPayment;
    this.props.loadAllPsp(idWallet, idPayment);
  }

  private headerItem = (
    <View style={styles.padded}>
      <View style={styles.header}>
        <H5 weight="Regular" color="bluegrey">
          {I18n.t("wallet.pickPsp.provider")}
        </H5>
        <H5 weight="Regular" color="bluegrey">{`${I18n.t(
          "wallet.pickPsp.maxFee"
        )} (€)`}</H5>
      </View>
      <VSpacer size={16} />
      <ItemSeparatorComponent noPadded />
    </View>
  );

  public render(): React.ReactNode {
    const availablePsps = orderPspByAmount(this.props.allPsps);

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.pickPsp.headerTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["payment"]}
      >
        {this.props.isLoading || this.props.hasError ? (
          <LoadingErrorComponent
            isLoading={this.props.isLoading}
            onRetry={() => {
              this.props.loadAllPsp(
                this.props.route.params.wallet.idWallet,
                this.props.route.params.idPayment
              );
            }}
            loadingCaption={I18n.t("wallet.pickPsp.loadingPsps")}
          />
        ) : (
          <SafeAreaView style={IOStyles.flex} testID="PickPspScreen">
            <VSpacer size={16} />
            <View style={styles.padded}>
              <H1>{I18n.t("wallet.pickPsp.title")}</H1>
              <VSpacer size={8} />
              <H4 weight="Regular" color="bluegreyDark">
                {I18n.t("wallet.pickPsp.info")}
              </H4>
              <H4 weight="Regular" color="bluegreyDark">
                {I18n.t("wallet.pickPsp.info2")}
                <H4 color="bluegreyDark">{` ${I18n.t(
                  "wallet.pickPsp.info2Bold"
                )}`}</H4>
              </H4>
            </View>
            <VSpacer size={16} />
            <FlatList
              testID="pspList"
              ItemSeparatorComponent={() => <ItemSeparatorComponent />}
              removeClippedSubviews={false}
              data={availablePsps}
              keyExtractor={item => item.idPsp}
              renderItem={({ item }) => (
                <PspComponent
                  psp={item}
                  onPress={() => this.props.pickPsp(item, this.props.allPsps)}
                />
              )}
              ListHeaderComponent={this.headerItem}
              ListFooterComponent={() => <ItemSeparatorComponent />}
            />
            <FooterWithButtons
              type="SingleButton"
              leftButton={cancelButtonProps(
                this.props.navigateBack,
                I18n.t("global.buttons.back")
              )}
            />
          </SafeAreaView>
        )}
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const psps = pspV2ListSelector(state);
  return {
    isLoading:
      pot.isLoading(state.wallet.wallets.walletById) || isLoading(psps),
    hasError: pot.isError(state.wallet.wallets.walletById) || isError(psps),
    allPsps: getValueOrElse(psps, [])
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  navigateBack: () => navigateBack(),
  loadAllPsp: (idWallet: number, idPayment: string) => {
    dispatch(
      pspForPaymentV2.request({
        idWallet,
        idPayment
      })
    );
  },
  pickPsp: (psp: PspData, psps: ReadonlyArray<PspData>) =>
    dispatchUpdatePspForWalletAndConfirm(dispatch)(
      psp,
      props.route.params.wallet,
      props.route.params.rptId,
      props.route.params.initialAmount,
      props.route.params.verifica,
      props.route.params.idPayment,
      psps,
      () =>
        showToast(I18n.t("wallet.pickPsp.onUpdateWalletPspFailure"), "danger")
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(PickPspScreen));
