import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { PrivativePaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import BasePrivativeCard from "../component/card/BasePrivativeCard";

type NavigationParams = Readonly<{
  privative: PrivativePaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a privative card
 * @constructor
 */
const PrivativeDetailScreen: React.FunctionComponent<Props> = props => {
  const privative: PrivativePaymentMethod =
    props.navigation.getParam("privative");
  return (
    <BasePaymentMethodScreen
      paymentMethod={privative}
      card={
        <BasePrivativeCard
          loyaltyLogo={privative.icon}
          caption={privative.caption}
          gdoLogo={privative.gdoLogo}
        />
      }
      content={<PaymentMethodFeatures paymentMethod={privative} />}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeDetailScreen);
