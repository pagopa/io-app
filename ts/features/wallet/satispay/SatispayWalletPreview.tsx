import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { nullType } from "io-ts";
import satispayImage from "../../../../img/wallet/cards-icons/satispay.png";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import { CardPreview } from "../component/CardPreview";
import { navigateToSatispayDetailScreen } from "../../../store/actions/navigation";
import { SatispayPaymentMethod } from "../../../types/pagopa";

type OwnProps = {
  satispay: SatispayPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

/**
 * A card preview for a bancomat card
 * @param props
 * @constructor
 */
const SatispayWalletPreview: React.FunctionComponent<Props> = props => (
  <CardPreview
    left={
      <Body style={IOStyles.flex} numberOfLines={1}>
        {I18n.t("wallet.methods.satispay.name")}
      </Body>
    }
    image={satispayImage}
    onPress={() => props.navigateToSatispayDetails(props.satispay)}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToSatispayDetails: (satispay: SatispayPaymentMethod) =>
    dispatch(navigateToSatispayDetailScreen(satispay))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SatispayWalletPreview);
