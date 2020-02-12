/**
 * This component will display the payment methods that can be registered
 * on the app
 */

import color from "color";
import { Badge, Left, ListItem, Right, Text, View } from "native-base";
import * as React from "react";
import { FlatList, Platform, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { ContextualHelp } from "../ContextualHelp";
import { withLightModalContext } from "../helpers/withLightModalContext";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import IconFont from "../ui/IconFont";
import { LightModalContextInterface } from "../ui/LightModal";
import Markdown from "../ui/Markdown";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";

type OwnProps = Readonly<{
  navigateToAddCreditCard: () => void;
}>;

type Props = OwnProps & LightModalContextInterface;

type IPaymentMethod = Readonly<{
  name: string;
  maxFee: string;
  icon: any;
  implemented: boolean;
  onPress?: () => void;
  showMaxFee: boolean;
}>;

const underlayColor = "transparent";
const styles = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    paddingRight: 0
  },
  disabled: {
    opacity: 0.75
  },
  methodTitle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: 18
  }
});

const AddMethodStyle = StyleSheet.create({
  transactionText: {
    fontSize: variables.fontSizeSmaller,
    color: color(variables.colorWhite)
      .darken(0.35)
      .string()
  },
  notImplementedBadge: {
    height: 18
  },
  notImplementedText: {
    fontSize: 10,
    lineHeight: Platform.OS === "ios" ? 14 : 16
  },
  centeredContents: {
    alignItems: "center"
  }
});

class PaymentMethodsList extends React.Component<Props, never> {
  private showHelp = () => {
    // tslint:disable-next-line:no-unused-expression
    this.props.showModal(
      <ContextualHelp
        onClose={this.props.hideModal}
        title={I18n.t("wallet.whyAFee.title")}
        body={() => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>}
      />
    );
  };

  public render(): React.ReactNode {
    const paymentMethods: ReadonlyArray<IPaymentMethod> = [
      {
        onPress: this.props.navigateToAddCreditCard,
        name: I18n.t("wallet.methods.card.name"),
        maxFee: I18n.t("wallet.methods.card.maxFee"),
        icon: "io-48-card",
        implemented: true,
        showMaxFee: true
      },
      {
        name: I18n.t("wallet.methods.mobile.name"),
        maxFee: I18n.t("wallet.methods.mobile.maxFee"),
        icon: "io-48-phone",
        implemented: false,
        showMaxFee: false
      },
      {
        name: "Postepay",
        maxFee: I18n.t("wallet.methods.bank.maxFee"),
        icon: "io-48-phone",
        implemented: false,
        showMaxFee: false
      },
      {
        name: "Paypal",
        maxFee: I18n.t("wallet.methods.bank.maxFee"),
        icon: "io-48-phone",
        implemented: false,
        showMaxFee: false
      },
      {
        name: I18n.t("wallet.methods.bank.name"),
        maxFee: I18n.t("wallet.methods.bank.maxFee"),
        icon: "io-48-phone",
        implemented: false,
        showMaxFee: false
      }
    ];
    return (
      <View>
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
                underlayColor={underlayColor}
              >
                <Left>
                  <Grid>
                    <Row>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center"
                        }}
                      >
                        <Text
                          bold={true}
                          style={[disabledStyle, styles.methodTitle]}
                        >
                          {itemInfo.item.name}
                        </Text>
                        {isItemDisabled && (
                          <Badge
                            style={[
                              AddMethodStyle.notImplementedBadge,
                              {
                                marginLeft: 4,
                                marginTop: 2,
                                backgroundColor: "#909DA8"
                              }
                            ]}
                          >
                            <Text style={AddMethodStyle.notImplementedText}>
                              {"in arrivo"}
                            </Text>
                          </Badge>
                        )}
                      </View>
                    </Row>
                    {itemInfo.item.showMaxFee && (
                      <Row>
                        <Text
                          style={[
                            AddMethodStyle.transactionText,
                            disabledStyle
                          ]}
                        >
                          {itemInfo.item.maxFee}
                        </Text>
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
        <TouchableDefaultOpacity onPress={this.showHelp}>
          <Text link={true}>{I18n.t("wallet.whyAFee.title")}</Text>
        </TouchableDefaultOpacity>
      </View>
    );
  }
}

export default withLightModalContext(PaymentMethodsList);
