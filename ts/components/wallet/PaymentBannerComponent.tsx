/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 */

import { Text, View } from "native-base";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../i18n";
import { WalletStyles } from "../styles/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

export default class PaymentBannerComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    const NOMEAVVISO = "Tari 2018";
    const IMPORTO = "€ 199,00";
    const ENTE = "Comune di Gallarate";

    return (
      <Grid style={[WalletStyles.topContainer, WalletStyles.paddedLR]}>
        <Row>
          <Col>
            <View spacer={true} />
            <Text bold={true} style={WalletStyles.white}>
              {NOMEAVVISO}
            </Text>
          </Col>
          <Col>
            <View spacer={true} />
            <Text
              bold={true}
              style={[WalletStyles.white, WalletStyles.textRight]}
            >
              {IMPORTO}
            </Text>
          </Col>
        </Row>
        <Row>
          <Col>
            <Text style={WalletStyles.white}>{ENTE}</Text>
            <View spacer={true} />
          </Col>
          <Col>
            <Text style={[WalletStyles.white, WalletStyles.textRight]}>
              {I18n.t("wallet.cancel")}
            </Text>
            <View spacer={true} />
          </Col>
        </Row>
      </Grid>
    );
  }
}
