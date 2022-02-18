import * as React from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import CobadgeCard from "../component/CoBadgeCard";

type NavigationParams = Readonly<{
  cobadge: CreditCardPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationStackScreenProps<NavigationParams>;

/**
 * Detail screen for a cobadge card
 * @constructor
 */
const CobadgeDetailScreen: React.FunctionComponent<Props> = props => {
  const cobadge: CreditCardPaymentMethod = props.navigation.getParam("cobadge");
  return (
    <BasePaymentMethodScreen
      paymentMethod={cobadge}
      card={<CobadgeCard enhancedCoBadge={cobadge} />}
      content={<PaymentMethodFeatures paymentMethod={cobadge} />}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CobadgeDetailScreen);
