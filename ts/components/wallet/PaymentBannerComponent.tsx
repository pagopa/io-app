/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 * TODO: integrate with walletAPI
 *   @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
 */

import { Text, View } from "native-base";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProps, NavigationState } from "react-navigation";
import I18n from "../../i18n";
import { WalletStyles } from "../styles/wallet";

type OwnProps = Readonly<{
  paymentReason: string;
  currentAmount: string;
  entity: string;
}>;

type Props = OwnProps & NavigationScreenProps<NavigationState>;

export default class PaymentBannerComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <Grid style={[WalletStyles.topContainer, WalletStyles.paddedLR]}>
        <Row>
          <Col>
            <View spacer={true} />
            <Text bold={true} style={WalletStyles.white}>
              {this.props.paymentReason}
            </Text>
          </Col>
          <Col>
            <View spacer={true} />
            <Text
              bold={true}
              style={[WalletStyles.white, WalletStyles.textRight]}
            >
              {`${this.props.currentAmount} €`}
            </Text>
          </Col>
        </Row>
        <Row>
          <Col>
            <Text style={WalletStyles.white}>{this.props.entity}</Text>
            <View spacer={true} />
          </Col>
          <Col>
            <Text style={[WalletStyles.white, WalletStyles.textRight]}>
              {I18n.t("wallet.cancel").toUpperCase()}
            </Text>
            <View spacer={true} />
          </Col>
        </Row>
      </Grid>
    );
  }
}
