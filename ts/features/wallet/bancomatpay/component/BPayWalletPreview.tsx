import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
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
    left={
      <Body style={IOStyles.flex} numberOfLines={1}>
        {props.bPay.info.bankName ?? I18n.t("wallet.methods.bancomatPay.name")}
      </Body>
    }
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
