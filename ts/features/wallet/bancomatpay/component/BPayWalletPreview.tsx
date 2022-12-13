import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import bPayImage from "../../../../../img/wallet/cards-icons/bPay.png";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { navigateToBPayDetailScreen } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";
import { BPayPaymentMethod } from "../../../../types/pagopa";
import { CardLogoPreview } from "../../component/card/CardLogoPreview";

type OwnProps = {
  bPay: BPayPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

/**
 * Render the phone number.
 * @param props
 */
const renderLeft = (props: Props) => (
  <Body style={IOStyles.flex} numberOfLines={1} testID={"phoneNumber"}>
    {props.bPay?.info?.numberObfuscated}
  </Body>
);

const getAccessibilityRepresentation = () => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.bancomatPay");
  const cta = I18n.t("wallet.accessibility.folded.cta");
  return `${cardRepresentation}, ${cta}`;
};

/**
 * A card preview for a bancomat card
 * @param props
 * @constructor
 */
const BPayWalletPreview: React.FunctionComponent<Props> = props => (
  <CardLogoPreview
    accessibilityLabel={getAccessibilityRepresentation()}
    left={renderLeft(props)}
    image={bPayImage}
    onPress={() => props.navigateToBPayDetails(props.bPay)}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToBPayDetails: (bPay: BPayPaymentMethod) =>
    navigateToBPayDetailScreen(bPay)
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BPayWalletPreview);
