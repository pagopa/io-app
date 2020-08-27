import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, ListRenderItemInfo, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { ContextualHelp } from "../../../components/ContextualHelp";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { paymentFetchAllPspsForPaymentId } from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { allPspsSelector } from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";
import customVariables from "../../../theme/variables";
import { Psp, Wallet } from "../../../types/pagopa";
import { orderPspByAmount } from "../../../utils/payment";
import { showToast } from "../../../utils/showToast";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import { dispatchUpdatePspForWalletAndConfirm } from "./common";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
  psps: ReadonlyArray<Psp>;
  wallet: Wallet;
  chooseToChange?: boolean;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface &
  OwnProps;

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flexDirection: "column"
  },
  line1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  feeText: {
    color: variables.brandDarkGray
  },

  flexStart: {
    width: 100,
    height: 50
  },
  padded: { paddingHorizontal: customVariables.contentPadding }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.pickPsp.contextualHelpTitle",
  body: "wallet.pickPsp.contextualHelpContent"
};

const ICON_SIZE = 24;

/**
 * Select a PSP to be used for a the current selected wallet
 */
class PickPspScreen extends React.Component<Props> {
  private showHelp = () => {
    this.props.showModal(
      <ContextualHelp
        onClose={this.props.hideModal}
        title={I18n.t("wallet.pickPsp.contextualHelpTitle")}
        body={() => (
          <Markdown>{I18n.t("wallet.pickPsp.contextualHelpContent")}</Markdown>
        )}
      />
    );
  };

  public componentDidMount() {
    // load all psp in order to offer to the user the complete psps list
    const idWallet = this.props.navigation
      .getParam("wallet")
      .idWallet.toString();
    const idPayment = this.props.navigation.getParam("idPayment");
    this.props.loadAllPsp(idWallet, idPayment);
  }

  private getListItem = (psp: ListRenderItemInfo<Psp>) => {
    const { item } = psp;
    return (
      <TouchableDefaultOpacity
        onPress={() => this.props.pickPsp(item.id, this.props.allPsps)}
        style={styles.itemContainer}
      >
        <View style={styles.line1}>
          <Image
            style={styles.flexStart}
            resizeMode={"contain"}
            source={{ uri: item.logoPSP }}
          />
          <IconFont
            name={"io-right"}
            size={ICON_SIZE}
            color={customVariables.contentPrimaryBackground}
          />
        </View>
        <Text style={styles.feeText}>
          {`${I18n.t("wallet.pickPsp.maxFee")} `}
          <Text bold={true} style={styles.feeText}>
            {formatNumberCentsToAmount(item.fixedCost.amount)}
          </Text>
        </Text>
      </TouchableDefaultOpacity>
    );
  };

  public render(): React.ReactNode {
    const availablePsps = orderPspByAmount(this.props.allPsps);

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.pickPsp.title")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["payment"]}
      >
        <Content noPadded={true}>
          <View spacer={true} />
          <View style={styles.padded}>
            <Text>
              {!this.props.navigation.getParam("chooseToChange") &&
                `${I18n.t("wallet.pickPsp.info")} `}
              <Text bold={true}>{`${I18n.t("wallet.pickPsp.infoBold")} `}</Text>
              <Text>{`${I18n.t("wallet.pickPsp.info2")} `}</Text>
            </Text>
            <Text link={true} onPress={this.showHelp}>
              {I18n.t("wallet.pickPsp.link")}
            </Text>
          </View>
          <View spacer={true} />
          <FlatList
            ItemSeparatorComponent={() => <ItemSeparatorComponent />}
            removeClippedSubviews={false}
            data={availablePsps}
            keyExtractor={item => item.id.toString()}
            renderItem={this.getListItem}
            ListFooterComponent={<EdgeBorderComponent />}
          />
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const psps = allPspsSelector(state);
  return {
    isLoading:
      pot.isLoading(state.wallet.wallets.walletById) || pot.isLoading(psps),
    allPsps: pot.getOrElse(psps, [])
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    loadAllPsp: (idWallet: string, idPayment: string) => {
      dispatch(
        paymentFetchAllPspsForPaymentId.request({
          idWallet,
          idPayment
        })
      );
    },
    pickPsp: (idPsp: number, psps: ReadonlyArray<Psp>) =>
      dispatchUpdatePspForWalletAndConfirm(dispatch)(
        idPsp,
        props.navigation.getParam("wallet"),
        props.navigation.getParam("rptId"),
        props.navigation.getParam("initialAmount"),
        props.navigation.getParam("verifica"),
        props.navigation.getParam("idPayment"),
        psps,
        () =>
          showToast(I18n.t("wallet.pickPsp.onUpdateWalletPspFailure"), "danger")
      )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(withLoadingSpinner(PickPspScreen)));
