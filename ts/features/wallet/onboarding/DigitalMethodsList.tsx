import { ListItem, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";
import I18n from "../../../i18n";
import { H3 } from "../../../components/core/typography/H3";
import { H5 } from "../../../components/core/typography/H5";

type DigitalPaymentItem = {
  name: string;
  subtitle?: string;
  logo?: ImageSourcePropType;
  onPress?: () => void;
  implemented?: boolean;
};

const styles = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    paddingRight: 0,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  logo: { width: 80, height: 40, resizeMode: "cover" }
});

const getMethods = (): ReadonlyArray<DigitalPaymentItem> => [
  {
    name: I18n.t("wallet.methods.bancomatPay.name"),
    subtitle: I18n.t("wallet.methods.bancomatPay.description"),
    logo: require("../../../../img/wallet/payment-methods/bancomatpay-logo.png"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.satispay.name"),
    subtitle: I18n.t("wallet.methods.satispay.description"),
    logo: require("../../../../img/wallet/cards-icons/satispay.png"),
    implemented: true
  },
  {
    name: I18n.t("wallet.methods.paypal.name"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.postepayApp.name"),
    subtitle: I18n.t("wallet.methods.postepayApp.description"),
    implemented: false
  }
];

const DigitalMethodsList: React.FunctionComponent = () => (
  <FlatList
    scrollEnabled={false}
    data={getMethods()}
    renderItem={({ item }: ListRenderItemInfo<DigitalPaymentItem>) =>
      item.implemented && (
        <ListItem style={styles.listItem} onPress={item.onPress}>
          <View>
            <H3>{item.name}</H3>
            {item.subtitle && <H5 weight={"Regular"}>{item.subtitle}</H5>}
          </View>
          {item.logo && <Image source={item.logo} style={styles.logo} />}
        </ListItem>
      )
    }
    keyExtractor={item => item.name}
  />
);

export default DigitalMethodsList;
