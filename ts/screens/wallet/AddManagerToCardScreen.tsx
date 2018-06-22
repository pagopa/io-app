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
import { TransactionManager } from "../../types/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const paymentManagers: ReadonlyArray<
  TransactionManager
> = WalletAPI.getManagers();

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

export class AddManagerToCardScreen extends React.Component<Props, never> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

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
          <H1>{I18n.t("wallet.addManager.title")}</H1>
          <View spacer={true} />
          <Text>
            {`${I18n.t("wallet.addManager.info")} `}
            <Text bold={true}>
              {`${I18n.t("wallet.addManager.infoBold")} `}
            </Text>
            <Text>{`${I18n.t("wallet.addManager.info2")} `}</Text>
            <Text link={true}>{I18n.t("wallet.addManager.link")}</Text>
          </Text>
          <View spacer={true} />
          <FlatList
            ItemSeparatorComponent={() => (
              <View style={WalletStyles.bottomBorder} />
            )}
            removeClippedSubviews={false}
            numColumns={1}
            data={paymentManagers}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={style.listItem}>
                <Grid>
                  <Col size={6}>
                    <View spacer={true} />
                    <Row>
                      <Image
                        style={style.flexStart}
                        resizeMode={"contain"}
                        source={item.icon}
                      />
                    </Row>
                    <Row>
                      <Text style={style.feeText}>
                        {`${I18n.t("wallet.addManager.maxFee")} `}
                        <Text bold={true} style={style.feeText}>
                          {`${item.maxFee} € `}
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
