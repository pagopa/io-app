import { ListItem, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { constNull } from "fp-ts/lib/function";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { H3 } from "../../../components/core/typography/H3";
import { H5 } from "../../../components/core/typography/H5";
import { GlobalState } from "../../../store/reducers/types";
import { payPalEnabled } from "../../../config";
import { walletAddSatispayStart } from "./satispay/store/actions";
import { walletAddBPayStart } from "./bancomatPay/store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

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
  logo: { width: 80, height: 40, resizeMode: "contain", marginRight: 16 }
});

const getMethods = (props: Props): ReadonlyArray<DigitalPaymentItem> => [
  {
    name: I18n.t("wallet.methods.bancomatPay.name"),
    logo: require("../../../../img/wallet/payment-methods/bancomatpay-logo.png"),
    onPress: props.startBPayOnboarding,
    implemented: true
  },
  {
    name: I18n.t("wallet.methods.satispay.name"),
    subtitle: I18n.t("wallet.methods.satispay.description"),
    logo: require("../../../../img/wallet/cards-icons/satispay.png"),
    onPress: props.startSatispayOnboarding,
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.paypal.name"),
    logo: require("../../../../img/wallet/cards-icons/paypal.png"),
    // TODO replace with effective dispatch
    onPress: constNull,
    implemented: payPalEnabled
  },
  {
    name: I18n.t("wallet.methods.postepayApp.name"),
    subtitle: I18n.t("wallet.methods.postepayApp.description"),
    implemented: false
  }
];

const DigitalMethodsList = (props: Props) => (
  <FlatList
    scrollEnabled={false}
    data={getMethods(props)}
    renderItem={({ item }: ListRenderItemInfo<DigitalPaymentItem>) =>
      item.implemented && (
        <ListItem style={styles.listItem} onPress={item.onPress}>
          <View style={IOStyles.flex}>
            <H3>{item.name}</H3>
            {item.subtitle && <H5 weight={"Regular"}>{item.subtitle}</H5>}
          </View>
          {item.logo && <Image source={item.logo} style={styles.logo} />}
          <IconFont name={"io-right"} color={IOColors.blue} size={24} />
        </ListItem>
      )
    }
    keyExtractor={item => item.name}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startSatispayOnboarding: () => dispatch(walletAddSatispayStart()),
  startBPayOnboarding: () => dispatch(walletAddBPayStart())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(DigitalMethodsList);
