import { Content, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import BlockButtons from "../../../components/ui/BlockButtons";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { navigateToTransactionDetailsScreen } from "../../../store/actions/navigation";
import { backToEntrypointPayment } from "../../../store/actions/wallet/payment";
import customVariables from "../../../theme/variables";
import { Transaction } from "../../../types/pagopa";

type NavigationParams = Readonly<{
  transaction: Transaction;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  center: {
    alignSelf: "center"
  }
});

class TransactionSuccessScreen extends React.PureComponent<Props> {
  private transaction = this.props.navigation.getParam("transaction");
  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  private handleBackPress = () => {
    this.props.backToEntrypointPayment();
    return true;
  };

  public render() {
    return (
      <BaseScreenComponent>
        <Content>
          <View spacer={true} extralarge={true} />
          <IconFont
            name={"io-complete"}
            size={120}
            color={customVariables.brandHighlight}
            style={styles.center}
          />
          <View spacer={true} />
          <Text alignCenter={true}>{`${I18n.t("global.genericThanks")},`}</Text>
          <Text alignCenter={true} bold={true}>
            {I18n.t("wallet.ConfirmPayment.transactionSuccess")}
          </Text>
        </Content>

        <View footer={true}>
          <BlockButtons
            type={"SingleButton"}
            leftButton={{
              title: I18n.t("wallet.receipt"),
              primary: true,
              onPress: () => this.props.navigateToReceipt(this.transaction)
            }}
          />
          <View spacer={true} />
          <BlockButtons
            type={"SingleButton"}
            leftButton={{
              title: I18n.t("global.buttons.close"),
              light: true,
              bordered: true,
              onPress: this.props.backToEntrypointPayment
            }}
          />
        </View>
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToReceipt: (transaction: Transaction) =>
    dispatch(
      navigateToTransactionDetailsScreen({
        isPaymentCompletedTransaction: true,
        transaction
      })
    ),
  backToEntrypointPayment: () => dispatch(backToEntrypointPayment())
});

export default connect(undefined, mapDispatchToProps)(TransactionSuccessScreen);
