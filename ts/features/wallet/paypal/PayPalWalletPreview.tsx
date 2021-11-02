import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { constNull } from "fp-ts/lib/function";
import payPalCard from "../../../../img/wallet/cards-icons/paypal_card.png";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import { CardLogoPreview } from "../component/card/CardLogoPreview";

// TODO temporary type
type PayPalPaymentMethod = {
  email: string;
};

type OwnProps = {
  paypal: PayPalPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

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
const PayPalWalletPreview: React.FunctionComponent<Props> = props => (
  <CardLogoPreview
    accessibilityLabel={getAccessibilityRepresentation()}
    left={
      <Body style={[IOStyles.flex, { paddingRight: 16 }]} numberOfLines={1}>
        {props.paypal.email}
      </Body>
    }
    image={payPalCard}
    onPress={() => props.navigateToPayPalDetails(props.paypal)}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO replace with the effective handler
  navigateToPayPalDetails: (_: PayPalPaymentMethod) => constNull
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalWalletPreview);
