/**
 * This component will display the payment method that can be registered
 * on the app
 * TODO: replace the contextual help with the appropriate
 *  component @https://www.pivotaltracker.com/story/show/157874540
 */

import color from "color";
import { Badge, Left, ListItem, Right, Text, View } from "native-base";
import * as React from "react";
import { Alert, FlatList, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import {
  ContextualHelpInjectedProps,
  withContextualHelp
} from "../helpers/withContextualHelp";
import IconFont from "../ui/IconFont";
import Markdown from "../ui/Markdown";

type OwnProps = Readonly<{
  navigateToAddCreditCard: () => void;
}>;

type Props = OwnProps & ContextualHelpInjectedProps;

type IPaymentMethod = Readonly<{
  onPress: () => void;
  name: string;
  maxFee: string;
  icon: any;
  implemented: boolean;
}>;

const styles = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    paddingRight: 0
  },
  disabled: {
    opacity: 0.75
  }
});

const unavailableAlert = () =>
  Alert.alert(
    I18n.t("wallet.pickPaymentMethod.unavailable.title"),
    I18n.t("wallet.pickPaymentMethod.unavailable.message")
  );

const AddMethodStyle = StyleSheet.create({
  transactionText: {
    fontSize: variables.fontSizeSmaller,
    color: color(variables.colorWhite)
      .darken(0.35)
      .string()
  },
  notImplementedText: {
    fontSize: variables.fontSizeSmaller
  },
  centeredContents: {
    alignItems: "center"
  }
});

class PaymentMethodsList extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const paymentMethods: ReadonlyArray<IPaymentMethod> = [
      {
        onPress: this.props.navigateToAddCreditCard,
        name: I18n.t("wallet.methods.card.name"),
        maxFee: I18n.t("wallet.methods.card.maxFee"),
        icon: "io-48-card",
        implemented: true
      },
      {
        name: I18n.t("wallet.methods.bank.name"),
        maxFee: I18n.t("wallet.methods.bank.maxFee"),
        icon: "io-48-bank",
        onPress: unavailableAlert, // TODO: handle when destination is available @https://www.pivotaltracker.com/story/show/157588719
        implemented: false
      },
      {
        name: I18n.t("wallet.methods.mobile.name"),
        maxFee: I18n.t("wallet.methods.mobile.maxFee"),
        icon: "io-48-phone",
        onPress: unavailableAlert, // TODO: handle when destination is available @https://www.pivotaltracker.com/story/show/157588719
        implemented: false
      }
    ];
    return (
      <View>
        <Text>{I18n.t("wallet.chooseMethod")}</Text>
        <View spacer={true} />
        <FlatList
          removeClippedSubviews={false}
          data={paymentMethods}
          keyExtractor={item => item.name}
          renderItem={itemInfo => {
            const isItemDisabled = !itemInfo.item.implemented;
            const disabledStyle = isItemDisabled ? styles.disabled : {};
            return (
              <ListItem
                style={[styles.listItem]}
                onPress={itemInfo.item.onPress}
              >
                <Left>
                  <Grid>
                    <Row>
                      <Text bold={true} style={disabledStyle}>
                        {itemInfo.item.name}
                      </Text>
                    </Row>
                    <Row>
                      <Text
                        style={[AddMethodStyle.transactionText, disabledStyle]}
                      >
                        {itemInfo.item.maxFee}
                      </Text>
                    </Row>
                    {isItemDisabled && (
                      <Row>
                        <Badge primary={true}>
                          <Text style={AddMethodStyle.notImplementedText}>
                            {I18n.t("wallet.methods.notImplemented")}
                          </Text>
                        </Badge>
                      </Row>
                    )}
                  </Grid>
                </Left>
                <Right style={AddMethodStyle.centeredContents}>
                  <IconFont
                    name={itemInfo.item.icon}
                    color={
                      isItemDisabled
                        ? variables.brandLightGray
                        : variables.brandPrimary
                    }
                    size={variables.iconSize6}
                  />
                </Right>
              </ListItem>
            );
          }}
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
