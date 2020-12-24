import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Image, ImageStyle, StyleProp } from "react-native";
import bPayImage from "../../../../../img/wallet/cards-icons/bPay.png";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { CardPreview } from "../../component/CardPreview";
import { navigateToSatispayDetailScreen } from "../../../../store/actions/navigation";
import {
  BPayPaymentMethod,
  SatispayPaymentMethod
} from "../../../../types/pagopa";
import reactotron from "reactotron-react-native";

type OwnProps = {
  bPay: BPayPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

/**
 * A card preview for a bancomat card
 * @param props
 * @constructor
 */
const BPayWalletPreview: React.FunctionComponent<Props> = props => (
  <CardPreview
    left={<Image source={{ uri: props.bPay.info.instituteCode }} />}
    image={bPayImage}
    onPress={() => reactotron.log(props.bPay)}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToSatispayDetails: (satispay: SatispayPaymentMethod) =>
    dispatch(navigateToSatispayDetailScreen(satispay))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BPayWalletPreview);
