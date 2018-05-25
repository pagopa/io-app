/**
 * This is the screen presented to the user
 * when they request adding a new payment method.
 * From here, they can select their payment method
 * of choice (although only credit cards will be allowed
 * initially).
 * Keep in mind that the rest of the "add credit card" process
 * is handled @https://www.pivotaltracker.com/story/show/157838293
 */
import * as React from "react";
import I18n from "../../i18n";

import {
  Body,
  Button,
  Container,
  Content,
  Grid,
  H1,
  Icon,
  Left,
  ListItem,
  Right,
  Row,
  Text,
  View
} from "native-base";
import { FlatList, Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AppHeader from "../../components/ui/AppHeader";
import Modal from "../../components/ui/Modal";
import ROUTES from "../../navigation/routes";
import variables from "../../theme/variables";

// Images
const bankLogo = require("../../../img/wallet/payment-methods/bank.png");
const creditCardLogo = require("../../../img/wallet/payment-methods/creditcard.png");
const mobileLogo = require("../../../img/wallet/payment-methods/mobile.png");

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
  isTosModalVisible: boolean;
}>;

type Route = keyof typeof ROUTES;
interface IPaymentMethod {
  navigateTo: Route | "";
  name: string;
  maxFee: string;
  icon: any;
}

const paymentMethods: ReadonlyArray<IPaymentMethod> = [
  {
    navigateTo: "", // TODO: add route when destination is available @https://www.pivotaltracker.com/story/show/157588719
    name: I18n.t("wallet.methods.card.name"),
    maxFee: I18n.t("wallet.methods.card.maxFee"),
    icon: creditCardLogo
  },
  {
    navigateTo: "",
    name: I18n.t("wallet.methods.bank.name"),
    maxFee: I18n.t("wallet.methods.bank.maxFee"),
    icon: bankLogo
  },
  {
    navigateTo: "",
    name: I18n.t("wallet.methods.mobile.name"),
    maxFee: I18n.t("wallet.methods.mobile.maxFee"),
    icon: mobileLogo
  }
];

const AddMethodStyle = StyleSheet.create({
  paymentMethodEntry: {
    marginLeft: 0,
    paddingRight: 0,
    height: 75
  },
  transactionText: {
    fontSize: variables.fontSize1,
    color: "#a6a6a6" // WIP to be updated to variables.white.darken(.35)
  },
  centeredContents: {
    alignItems: "center"
  },
  containedImage: {
    width: "100%",
    resizeMode: "contain"
  }
});

// TODO: replace the contextual help with the approariate
// component @https://www.pivotaltracker.com/story/show/157874540
export class AddPaymentMethodScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isTosModalVisible: false
    };
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation;

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button
              transparent={true}
              onPress={_ => this.props.navigation.goBack()}
            >
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.addPaymentMethodTitle")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <Text>{I18n.t("wallet.chooseMethod")}</Text>
          <View spacer={true} large={true} />
          <FlatList
            removeClippedSubviews={false}
            data={paymentMethods}
            renderItem={itemInfo => (
              <ListItem
                style={AddMethodStyle.paymentMethodEntry}
                onPress={() => navigate(itemInfo.item.navigateTo)}
              >
                <Left>
                  <Grid>
                    <Row>
                      <Text style={{ fontWeight: "bold" }}>
                        {/* WIP will be changed to "bold={true}" when PR #162 passes */}
                        {itemInfo.item.name}
                      </Text>
                    </Row>
                    <Row>
                      <Text style={AddMethodStyle.transactionText}>
                        {itemInfo.item.maxFee}
                      </Text>
                    </Row>
                  </Grid>
                </Left>
                <Right style={AddMethodStyle.centeredContents}>
                  <Image
                    source={itemInfo.item.icon}
                    style={AddMethodStyle.containedImage}
                  />
                </Right>
              </ListItem>
            )}
          />
          <View spacer={true} large={true} />
          <Text
            link={true}
            onPress={(): void => this.setState({ isTosModalVisible: true })}
          >
            {I18n.t("wallet.whyFee")}
          </Text>
        </Content>

        <View footer={true}>
          <Button
            block={true}
            cancel={true}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>

        <Modal isVisible={this.state.isTosModalVisible} fullscreen={true}>
          <View header={true}>
            <Icon
              name="cross"
              onPress={(): void => this.setState({ isTosModalVisible: false })}
            />
          </View>
          <Content>
            <H1>{I18n.t("personal_data_processing.title")}</H1>
            <View spacer={true} large={true} />
            <Text>{I18n.t("personal_data_processing.content")}</Text>
          </Content>
        </Modal>
      </Container>
    );
  }
}
