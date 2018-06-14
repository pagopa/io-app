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
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { transactionManager } from "../../types/wallet";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const paymentManagers: ReadonlyArray<
  transactionManager
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

  feetext: {
    color: variables.brandDarkGray,
    fontSize: variables.fontSize2
  }
});

/**
 * Selection of a payment manager for the new added card
 */
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
          <H1>{I18n.t("wallet.AddManager.title")}</H1>
          <View spacer={true} />
          <Text>
            {I18n.t("wallet.AddManager.info") + " "}
            <Text bold={true}>
              {I18n.t("wallet.AddManager.infobold") + " "}
            </Text>
            <Text>{I18n.t("wallet.AddManager.info2") + " "}</Text>
            <Text link={true}>{I18n.t("wallet.AddManager.link")}</Text>
          </Text>
          <View spacer={true} />
          <FlatList
            ItemSeparatorComponent={() => (
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: variables.brandGray
                }}
              />
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
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start"
                        }}
                        resizeMode={"contain"}
                        source={item.icon}
                      />
                    </Row>
                    <Row>
                      <Text style={style.feetext}>
                        {I18n.t("wallet.AddManager.maxFee") + " "}
                        <Text bold={true} style={style.feetext}>
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
