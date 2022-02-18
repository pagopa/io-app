import * as React from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { SatispayPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import SatispayCard from "../SatispayCard";

type NavigationParams = Readonly<{
  satispay: SatispayPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationStackScreenProps<NavigationParams>;

/**
 * Detail screen for a satispay
 * @constructor
 */
const SatispayDetailScreen: React.FunctionComponent<Props> = props => {
  const satispay: SatispayPaymentMethod = props.navigation.getParam("satispay");
  return (
    <BasePaymentMethodScreen
      paymentMethod={satispay}
      card={<SatispayCard />}
      content={<PaymentMethodFeatures paymentMethod={satispay} />}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SatispayDetailScreen);
