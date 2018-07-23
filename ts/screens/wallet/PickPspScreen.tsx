/**
 * This screen allows to identify the proper manager for a credit card
 * when it is added to the user wallet
 */

import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Icon,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { amountBuilder } from "../../utils/stringBuilder";
import { Psp } from '../../../definitions/pagopa/Psp';
import { getPspId, getPspLogoUrl, getPspFee } from '../../types/wallet';
import { AmountInEuroCentsFromNumber } from '../../../node_modules/italia-ts-commons/lib/pagopa';

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const paymentManagers: ReadonlyArray<
  Psp
> = WalletAPI.getPsps();

const style = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    flex: 1,
    paddingRight: 0
  },

  icon: {
    flexDirection: "row",
    alignItems: "center"
  },

  feeText: {
    color: variables.brandDarkGray,
    fontSize: variables.fontSize2
  },

  flexStart: {
    flexDirection: "row",
    justifyContent: "flex-start"
  }
});

export default class PickPspScreen extends React.Component<Props, never> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  private extractFee = (p: Psp): number => AmountInEuroCentsFromNumber.encode(getPspFee(p));

  public render(): React.ReactNode {
    
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("saveCard.saveCard")}</Text>
          </Body>
        </AppHeader>

        <Content>
          <H1>{I18n.t("wallet.pickPsp.title")}</H1>
          <View spacer={true} />
          <Text>
            {`${I18n.t("wallet.pickPsp.info")} `}
            <Text bold={true}>
              {`${I18n.t("wallet.pickPsp.infoBold")} `}
            </Text>
            <Text>{`${I18n.t("wallet.pickPsp.info2")} `}</Text>
            <Text link={true}>{I18n.t("wallet.pickPsp.link")}</Text>
          </Text>
          <View spacer={true} />
          <FlatList
            ItemSeparatorComponent={() => (
              <View style={WalletStyles.bottomBorder} />
            )}
            removeClippedSubviews={false}
            numColumns={1}
            data={paymentManagers}
            keyExtractor={item => getPspId(item).toString()}
            renderItem={({ item }) => (
              <View style={style.listItem}>
                <Grid>
                  <Col size={6}>
                    <View spacer={true} />
                    <Row>
                      <Image
                        style={style.flexStart}
                        resizeMode={"contain"}
                        source={{uri: getPspLogoUrl(item)}}
                      />
                    </Row>
                    <Row>
                      <Text style={style.feeText}>
                        {`${I18n.t("wallet.pickPsp.maxFee")} `}
                        <Text bold={true} style={style.feeText}>
                          {amountBuilder(this.extractFee(item))}
                        </Text>
                      </Text>
                    </Row>
                    <View spacer={true} />
                  </Col>
                  <Col size={1} style={style.icon}>
                    <Icon name="chevron-right" />
                  </Col>
                </Grid>
              </View>
            )}
          />
        </Content>
      </Container>
    );
  }
}
