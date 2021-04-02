import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, View, H3 } from "native-base";
import * as React from "react";
import { FlatList, Image, ListRenderItemInfo, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { Label } from "../../../components/core/typography/Label";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { paymentFetchAllPspsForPaymentId } from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { allPspsSelector } from "../../../store/reducers/wallet/payment";
import customVariables from "../../../theme/variables";
import { Psp, Wallet } from "../../../types/pagopa";
import { orderPspByAmount } from "../../../utils/payment";
import { showToast } from "../../../utils/showToast";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { navigateBack } from "../../../store/actions/navigation";
import { Body } from "../../../components/core/typography/Body";
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
  feeContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  imageProvider: {
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

type State = {
  hasImageLoadingError: boolean;
};
/**
 * Select a PSP to be used for a the current selected wallet
 */
class PickPspScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasImageLoadingError: false
    };
  }

  private onErrorImageLoading = () =>
    this.setState({ hasImageLoadingError: true });

  public componentDidMount() {
    // load all psp in order to offer to the user the complete psps list
    const idWallet = this.props.navigation
      .getParam("wallet")
      .idWallet.toString();
    const idPayment = this.props.navigation.getParam("idPayment");
    this.props.loadAllPsp(idWallet, idPayment);
  }

  private headerItem = (
    <View style={styles.padded}>
      <View style={styles.line1}>
        <LabelSmall weight="Regular" color="bluegrey">
          {I18n.t("wallet.pickPsp.provider")}
        </LabelSmall>
        <LabelSmall weight="Regular" color="bluegrey">
          {`${I18n.t("wallet.pickPsp.maxFee")} (€)`}
        </LabelSmall>
      </View>
      <View spacer />
      <ItemSeparatorComponent noPadded />
    </View>
  );

  private getListItem = (psp: ListRenderItemInfo<Psp>) => {
    const { item } = psp;

    return (
      <TouchableDefaultOpacity
        onPress={() => this.props.pickPsp(item.id, this.props.allPsps)}
        style={styles.itemContainer}
      >
        <View style={styles.line1}>
          {!this.state.hasImageLoadingError ? (
            <Image
              style={styles.imageProvider}
              resizeMode="contain"
              source={{ uri: item.logoPSP }}
              onError={this.onErrorImageLoading}
            />
          ) : (
            <Body>{item.businessName}</Body>
          )}
          <View style={styles.feeContainer}>
            <Label>{formatNumberCentsToAmount(item.fixedCost.amount)}</Label>
            <IconFont
              name="io-right"
              size={ICON_SIZE}
              color={customVariables.contentPrimaryBackground}
            />
          </View>
        </View>
      </TouchableDefaultOpacity>
    );
  };

  public render(): React.ReactNode {
    const availablePsps = orderPspByAmount(this.props.allPsps);

    const backButtonProps = {
      block: true,
      primary: true,
      bordered: true,
      onPress: this.props.navigateBack,
      title: I18n.t("global.buttons.back")
    };

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.pickPsp.headerTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["payment"]}
      >
        <Content noPadded>
          <View spacer />
          <View style={styles.padded}>
            <H3>{I18n.t("wallet.pickPsp.title")}</H3>
            <View spacer small />
            <Label weight="Regular" color="bluegreyDark">
              {I18n.t("wallet.pickPsp.info")}
            </Label>
            <Label weight="Regular" color="bluegreyDark">
              {I18n.t("wallet.pickPsp.info2")}
              <Label weight="Bold" color="bluegreyDark">{` ${I18n.t(
                "wallet.pickPsp.info2Bold"
              )}`}</Label>
            </Label>
          </View>
          <View spacer />
          <FlatList
            ItemSeparatorComponent={() => <ItemSeparatorComponent />}
            removeClippedSubviews={false}
            data={availablePsps}
            keyExtractor={item => item.id.toString()}
            renderItem={this.getListItem}
            ListHeaderComponent={this.headerItem}
            ListFooterComponent={() => <ItemSeparatorComponent />}
          />
        </Content>
        <FooterWithButtons type="SingleButton" leftButton={backButtonProps} />
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

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  navigateBack: () => dispatch(navigateBack()),
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(withLoadingSpinner(PickPspScreen)));
