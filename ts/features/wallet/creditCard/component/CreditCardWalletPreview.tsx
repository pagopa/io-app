import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import { navigateToCreditCardDetailScreen } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { BlurredPan } from "../../component/card/BlurredPan";
import { CardLogoPreview } from "../../component/card/CardLogoPreview";
import I18n from "../../../../i18n";

type OwnProps = {
  creditCard: CreditCardPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const getAccessibilityRepresentation = (
  creditCard: CreditCardPaymentMethod
) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.creditCard", {
    brand: creditCard.info.brand,
    blurredNumber: creditCard.info.blurredNumber
  });
  const cta = I18n.t("wallet.accessibility.folded.cta");
  return `${cardRepresentation}, ${cta}`;
};

/**
 * Folded preview representation for the Credit Card payment method.
 * @param props
 * @constructor
 */
const CreditCardWalletPreview = (props: Props): React.ReactElement => (
  <CardLogoPreview
    accessibilityLabel={getAccessibilityRepresentation(props.creditCard)}
    left={
      <BlurredPan style={IOStyles.flex} numberOfLines={1} testID={"caption"}>
        {props.creditCard.caption}
      </BlurredPan>
    }
    image={getCardIconFromBrandLogo(props.creditCard.info)}
    onPress={() => props.navigateToCreditCardDetail(props.creditCard)}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToCreditCardDetail: (creditCard: CreditCardPaymentMethod) =>
    navigateToCreditCardDetailScreen({ creditCard })
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditCardWalletPreview);
