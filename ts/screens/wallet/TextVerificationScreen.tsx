/**
 * This screen allows the user to input the code
 * received via text from PagoPA
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Input,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { TransactionSummary } from "../../types/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const styles = StyleSheet.create({
  contentPadding: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },
  textRight: {
    textAlign: "right"
  },
  bottomBordered: {
    borderBottomWidth: 1
  }
});

export class TextVerificationScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    const transaction: Readonly<
      TransactionSummary
    > = WalletAPI.getTransactionSummary();

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.textMsg.header")}</Text>
          </Body>
        </AppHeader>

        <Content noPadded={true} scrollEnabled={false}>
          <PaymentBannerComponent
            paymentReason={transaction.paymentReason}
            entity={transaction.entityName}
            currentAmount={transaction.currentAmount.toString()}
          />
          <View style={styles.contentPadding}>
            <View spacer={true} large={true} />
            <H1>{I18n.t("wallet.textMsg.title")}</H1>
            <View spacer={true} large={true} />

            <Grid>
              <Col>
                <Text bold={true} note={true}>
                  {I18n.t("wallet.textMsg.header")}
                </Text>
              </Col>
              <Col>
                <Text note={true} link={true} style={styles.textRight}>
                  {I18n.t("wallet.textMsg.newCode")}
                </Text>
              </Col>
            </Grid>
            <View spacer={true} />
            <Input style={styles.bottomBordered} keyboardType={"numeric"} />
            <View spacer={true} />
            <Text>{I18n.t("wallet.textMsg.info")}</Text>
          </View>
        </Content>

        <View footer={true}>
          <Button block={true} primary={true}>
            <Text>{I18n.t("global.buttons.continue")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={() => this.goBack()}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
