/**
 * This component will display the payment method that can be registered
 * on the app
 * TODO: replace the contextual help with the appropriate
 *  component @https://www.pivotaltracker.com/story/show/157874540
 */

import color from "color";
import { Left, ListItem, Right, Text, View } from "native-base";
import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import Icon from "../../theme/font-icons/io-icon-font/index";
import variables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Route = keyof typeof ROUTES;

type IPaymentMethod = Readonly<{
  navigateTo: Route | undefined;
  name: string;
  maxFee: string;
  icon: any;
}>;

const paymentMethods: ReadonlyArray<IPaymentMethod> = [
  {
    navigateTo: undefined, // TODO: add route when destination is available @https://www.pivotaltracker.com/story/show/157588719
    name: I18n.t("wallet.methods.card.name"),
    maxFee: I18n.t("wallet.methods.card.maxFee"),
    icon: "io-48-card"
  },
  {
    navigateTo: undefined,
    name: I18n.t("wallet.methods.bank.name"),
    maxFee: I18n.t("wallet.methods.bank.maxFee"),
    icon: "io-48-bank"
  },
  {
    navigateTo: undefined,
    name: I18n.t("wallet.methods.mobile.name"),
    maxFee: I18n.t("wallet.methods.mobile.maxFee"),
    icon: "io-48-phone"
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
    color: color(variables.colorWhite)
      .darken(0.35)
      .string()
  },
  centeredContents: {
    alignItems: "center"
  },
  containedImage: {
    width: "100%",
    resizeMode: "contain"
  }
});

export default class PaymentMethodsList extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const { navigate } = this.props.navigation;

    return (
      <View>
        <Text>{I18n.t("wallet.chooseMethod")}</Text>
        <View spacer={true} />
        <FlatList
          removeClippedSubviews={false}
          data={paymentMethods}
          keyExtractor={item => item.name}
          renderItem={itemInfo => (
            <ListItem
              style={AddMethodStyle.paymentMethodEntry}
              onPress={() =>
                itemInfo.item.navigateTo
                  ? navigate(itemInfo.item.navigateTo)
                  : undefined
              }
            >
              <Left>
                <Grid>
                  <Row>
                    <Text bold={true}>{itemInfo.item.name}</Text>
                  </Row>
                  <Row>
                    <Text style={AddMethodStyle.transactionText}>
                      {itemInfo.item.maxFee}
                    </Text>
                  </Row>
                </Grid>
              </Left>
              <Right style={AddMethodStyle.centeredContents}>
                <Icon
                  name={itemInfo.item.icon}
                  color={variables.brandPrimary}
                  size={variables.iconSize6}
                />
              </Right>
            </ListItem>
          )}
        />
        <View spacer={true} large={true} />
        <Text link={true}>{I18n.t("wallet.whyFee")}</Text>
      </View>
    );
  }
}
