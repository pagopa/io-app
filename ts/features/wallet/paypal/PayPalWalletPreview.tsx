import * as React from "react";
import payPalCard from "../../../../img/wallet/cards-icons/paypal_card.png";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { CardLogoPreview } from "../component/card/CardLogoPreview";
import { PayPalPaymentMethod } from "../../../types/pagopa";
import { navigateToPayPalDetailScreen } from "../../../store/actions/navigation";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { getPaypalAccountEmail } from "../../../utils/paypal";

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
  const navigation = useNavigationContext();
  const navigateToDetailScreen = () =>
    navigation.navigate(navigateToPayPalDetailScreen());
  return (
    <CardLogoPreview
      accessibilityLabel={getAccessibilityRepresentation()}
      left={
        <Body style={[IOStyles.flex, { paddingRight: 16 }]} numberOfLines={1}>
          {getPaypalAccountEmail(props.paypal.info)}
        </Body>
      }
      image={payPalCard}
      onPress={navigateToDetailScreen}
    />
  );
};

export default PayPalWalletPreview;
