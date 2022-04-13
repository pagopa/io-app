import { CompatNavigationProp } from "@react-navigation/compat";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import CobadgeCard from "../component/CoBadgeCard";

export type CobadgeDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  cobadge: CreditCardPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    navigation: CompatNavigationProp<
      IOStackNavigationProp<WalletParamsList, "WALLET_COBADGE_DETAIL">
    >;
  };

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
