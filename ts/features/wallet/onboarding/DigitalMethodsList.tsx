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
  subtitle: string;
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
    name: "BANCOMAT Pay",
    subtitle: "Paga con BANCOMAT Pay",
    logo: require("../../../../img/wallet/payment-methods/bancomatpay-logo.png"),
    implemented: true
  },
  {
    name: "Satispay",
    subtitle: "Paga con Satispay",
    logo: require("../../../../img/wallet/cards-icons/satispay.png"),
    implemented: true
  },
  {
    name: I18n.t("wallet.methods.postepay.name"),
    subtitle: I18n.t("wallet.methods.postepay.description"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.digital.name"),
    subtitle: I18n.t("wallet.methods.digital.description"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.bonus.name"),
    subtitle: I18n.t("wallet.methods.bonus.description"),
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
            <H5 weight={"Regular"}>{item.subtitle}</H5>
          </View>
          {item.logo && <Image source={item.logo} style={styles.logo} />}
        </ListItem>
      )
    }
    keyExtractor={item => item.name}
  />
);

export default DigitalMethodsList;
