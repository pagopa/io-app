/**
 * This component will display the payment method that can be registered
 * on the app
 * TODO: replace the contextual help with the appropriate
 *  component @https://www.pivotaltracker.com/story/show/157874540
 */

import color from "color";
import { Left, ListItem, Right, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import variables from "../../theme/variables";
import {
  ContextualHelpInjectedProps,
  withContextualHelp
} from "../helpers/withContextualHelp";
import { WalletStyles } from "../styles/wallet";
import IconFont from "../ui/IconFont";
import Markdown from "../ui/Markdown";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ContextualHelpInjectedProps;

type Route = keyof typeof ROUTES;

type IPaymentMethod = Readonly<{
  navigateTo: Route | undefined;
  name: string;
  maxFee: string;
  icon: any;
}>;

const paymentMethods: ReadonlyArray<IPaymentMethod> = [
  {
    navigateTo: ROUTES.WALLET_ADD_CARD as Route,
    name: I18n.t("wallet.methods.card.name"),
    maxFee: I18n.t("wallet.methods.card.maxFee"),
    icon: "io-48-card"
  },
  {
    navigateTo: undefined, // TODO: add route when destination is available @https://www.pivotaltracker.com/story/show/157588719
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

function paymentMethodName(paymentMethod: IPaymentMethod): string {
  return paymentMethod.name;
}

class PaymentMethodsList extends React.Component<Props> {
  private onPressItem = (item: IPaymentMethod) => {
    const route = item.navigateTo;
    return route !== undefined
      ? () => this.props.navigation.navigate(route)
      : () => undefined;
  };

  private renderItem = (itemInfo: ListRenderItemInfo<IPaymentMethod>) => (
    <ListItem
      style={[AddMethodStyle.paymentMethodEntry, WalletStyles.listItem]}
      onPress={this.onPressItem(itemInfo.item)}
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
        <IconFont
          name={itemInfo.item.icon}
          color={variables.brandPrimary}
          size={variables.iconSize6}
        />
      </Right>
    </ListItem>
  );

  public render(): React.ReactNode {
    return (
      <View>
        <Text>{I18n.t("wallet.chooseMethod")}</Text>
        <View spacer={true} />
        <FlatList
          removeClippedSubviews={false}
          data={paymentMethods}
          keyExtractor={paymentMethodName}
          renderItem={this.renderItem}
        />
        <View spacer={true} large={true} />
        <Text link={true} onPress={this.props.showHelp}>
          {I18n.t("wallet.whyAFee.title")}
        </Text>
      </View>
    );
  }
}

export default withContextualHelp(
  PaymentMethodsList,
  I18n.t("wallet.whyAFee.title"),
  () => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>
);
