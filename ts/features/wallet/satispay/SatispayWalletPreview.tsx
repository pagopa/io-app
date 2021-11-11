import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import satispayImage from "../../../../img/wallet/cards-icons/satispay.png";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { navigateToSatispayDetailScreen } from "../../../store/actions/navigation";
import { GlobalState } from "../../../store/reducers/types";
import { SatispayPaymentMethod } from "../../../types/pagopa";
import { CardLogoPreview } from "../component/card/CardLogoPreview";

type OwnProps = {
  satispay: SatispayPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const getAccessibilityRepresentation = () => {
  const satispay = I18n.t("wallet.onboarding.satispay.name");
  const cta = I18n.t("wallet.accessibility.folded.cta");
  return `${satispay}, ${cta}`;
};

/**
 * A card preview for a bancomat card
 * @param props
 * @constructor
 */
const SatispayWalletPreview: React.FunctionComponent<Props> = props => (
  <CardLogoPreview
    accessibilityLabel={getAccessibilityRepresentation()}
    left={
      <Body style={IOStyles.flex} numberOfLines={1}>
        {I18n.t("wallet.methods.satispay.name")}
      </Body>
    }
    image={satispayImage}
    onPress={() => props.navigateToSatispayDetails(props.satispay)}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToSatispayDetails: (satispay: SatispayPaymentMethod) =>
    navigateToSatispayDetailScreen(satispay)
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SatispayWalletPreview);
