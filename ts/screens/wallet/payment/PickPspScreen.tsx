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
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import customVariables from "../../../theme/variables";
import { Psp, Wallet } from "../../../types/pagopa";
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
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface &
  OwnProps;

const styles = StyleSheet.create({
  itemConteiner: {
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

  private getListItem = (psp: ListRenderItemInfo<Psp>) => {
    const { item } = psp;
    return (
      <TouchableDefaultOpacity
        onPress={() => this.props.pickPsp(item.id)}
        style={styles.itemConteiner}
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
    const availablePsps = this.props.navigation.getParam("psps");

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
              {`${I18n.t("wallet.pickPsp.info")} `}
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

const mapStateToProps = (state: GlobalState) => ({
  isLoading: pot.isLoading(state.wallet.wallets.walletById)
});

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    pickPsp: (idPsp: number) =>
      dispatchUpdatePspForWalletAndConfirm(dispatch)(
        idPsp,
        props.navigation.getParam("wallet"),
        props.navigation.getParam("rptId"),
        props.navigation.getParam("initialAmount"),
        props.navigation.getParam("verifica"),
        props.navigation.getParam("idPayment"),
        props.navigation.getParam("psps"),
        () =>
          showToast(I18n.t("wallet.pickPsp.onUpdateWalletPspFailure"), "danger")
      )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(withLoadingSpinner(PickPspScreen)));
