/**
 * This component will display the payment methods that can be registered
 * on the app
 */

import color from "color";
import { Badge, ListItem, Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, Platform, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import I18n from "../../i18n";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";
import { ContextualHelp } from "../ContextualHelp";
import { withLightModalContext } from "../helpers/withLightModalContext";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import IconFont from "../ui/IconFont";
import { LightModalContextInterface } from "../ui/LightModal";
import Markdown from "../ui/Markdown";

type OwnProps = Readonly<{
  navigateToAddCreditCard: () => void;
}>;

type Props = OwnProps & LightModalContextInterface;

type IPaymentMethod = Readonly<{
  name: string;
  maxFee?: string;
  icon?: any;
  image?: any;
  implemented: boolean;
}>;

const underlayColor = "transparent";
const styles = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    paddingRight: 0,
    flexDirection: "row"
  },
  disabled: {
    opacity: 0.75
  },
  methodItem: {
    flexDirection: "column"
  },
  methodTitle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: 18
  },
  methodImage: {
    width: 70
  },
  columnLeft: {
    flex: 0.7
  },
  columnRight: {
    flex: 0.3,
    alignItems: "center",
    alignContent: "center"
  }
});

const implementedMethod: IPaymentMethod = {
  name: I18n.t("wallet.methods.card.name"),
  maxFee: I18n.t("wallet.methods.card.maxFee"),
  icon: "io-48-card",
  implemented: true
};
const paymentMethods: ReadonlyArray<IPaymentMethod> = [
  {
    name: I18n.t("wallet.methods.satispay.name"),
    image: require("../../../img/wallet/payment-methods/satispay-logoi.png"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.postepay.name"),
    image: require("../../../img/wallet/payment-methods/postepay-logo.png"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.paypal.name"),
    image: require("../../../img/wallet/payment-methods/paypal-logo.png"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.bank.name"),
    image: require("../../../img/wallet/payment-methods/bancomatpay-logo.png"),
    implemented: false
  }
].sort((a, b) =>
  a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
);

const AddMethodStyle = StyleSheet.create({
  transactionText: {
    fontSize: variables.fontSizeSmaller,
    color: color(variables.colorWhite)
      .darken(0.35)
      .string()
  },
  notImplementedBadge: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.lightGray
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
    this.props.showModal(
      <ContextualHelp
        onClose={this.props.hideModal}
        title={I18n.t("wallet.whyAFee.title")}
        body={() => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>}
      />
    );
  };

  public render(): React.ReactNode {
    return (
      <View>
        <View spacer={true} large={true} />
        <FlatList
          removeClippedSubviews={false}
          data={[implementedMethod, ...paymentMethods]}
          keyExtractor={item => item.name}
          renderItem={itemInfo => {
            const isItemDisabled = !itemInfo.item.implemented;
            const disabledStyle = isItemDisabled ? styles.disabled : {};
            return (
              <ListItem
                style={styles.listItem}
                onPress={() => {
                  if (itemInfo.item.implemented) {
                    this.props.navigateToAddCreditCard();
                  }
                }}
                underlayColor={underlayColor}
              >
                <View style={styles.columnLeft}>
                  <Grid>
                    <Row>
                      <View style={styles.methodItem}>
                        <Text
                          bold={true}
                          style={[disabledStyle, styles.methodTitle]}
                        >
                          {itemInfo.item.name}
                        </Text>
                        {isItemDisabled && (
                          <Badge style={AddMethodStyle.notImplementedBadge}>
                            <Text style={AddMethodStyle.notImplementedText}>
                              {I18n.t("wallet.methods.comingSoon")}
                            </Text>
                          </Badge>
                        )}
                      </View>
                    </Row>
                    {itemInfo.item.maxFee && (
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
                </View>
                <View style={styles.columnRight}>
                  {itemInfo.item.icon && (
                    <IconFont
                      name={itemInfo.item.icon}
                      color={
                        isItemDisabled
                          ? variables.brandLightGray
                          : variables.brandPrimary
                      }
                      size={variables.iconSize6}
                    />
                  )}
                  {itemInfo.item.image && (
                    <Image
                      source={itemInfo.item.image}
                      style={styles.methodImage}
                      resizeMode={"contain"}
                    />
                  )}
                </View>
              </ListItem>
            );
          }}
        />
        <View spacer={true} large={true} />
        <TouchableDefaultOpacity onPress={this.showHelp}>
          <Text link={true}>{I18n.t("wallet.whyAFee.title")}</Text>
        </TouchableDefaultOpacity>
        <View spacer={true} large={true} />
      </View>
    );
  }
}

export default withLightModalContext(PaymentMethodsList);
