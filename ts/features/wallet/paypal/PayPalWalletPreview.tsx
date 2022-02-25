import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import payPalCard from "../../../../img/wallet/cards-icons/paypal_card.png";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { PayPalPaymentMethod } from "../../../types/pagopa";
import { getPaypalAccountEmail } from "../../../utils/paypal";
import { CardLogoPreview } from "../component/card/CardLogoPreview";

type OwnProps = {
  paypal: PayPalPaymentMethod;
};

type Props = OwnProps;

const getAccessibilityRepresentation = () => {
  const paypal = I18n.t("wallet.onboarding.paypal.name");
  const cta = I18n.t("wallet.accessibility.folded.cta");
  return `${paypal}, ${cta}`;
};

/**
 * A card preview for PayPal
 * @param props
 * @constructor
 */
const PayPalWalletPreview: React.FunctionComponent<Props> = props => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  return (
    <CardLogoPreview
      accessibilityLabel={getAccessibilityRepresentation()}
      left={
        <Body style={[IOStyles.flex, { paddingRight: 16 }]} numberOfLines={1}>
          {getPaypalAccountEmail(props.paypal.info)}
        </Body>
      }
      image={payPalCard}
      onPress={() =>
        navigation.navigate("WALLET_NAVIGATOR", {
          screen: "WALLET_PAYPAL_DETAIL"
        })
      }
    />
  );
};

export default PayPalWalletPreview;
