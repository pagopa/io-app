import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import BlockButtons from "../../../components/ui/BlockButtons";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import {
  navigateToTransactionDetailsScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
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
          <BlockButtons
            type={"SingleButton"}
            leftButton={{
              title: I18n.t("wallet.backToPayments"),
              light: true,
              bordered: true,
              onPress: this.props.resetToWalletHome
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
  resetToWalletHome: () => dispatch(navigateToWalletHome())
});

export default connect(
  undefined,
  mapDispatchToProps
)(TransactionSuccessScreen);
