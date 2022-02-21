import { CompatNavigationProp } from "@react-navigation/compat";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { GlobalState } from "../../../../store/reducers/types";
import { SatispayPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import SatispayCard from "../SatispayCard";

export type SatispayDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  satispay: SatispayPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    navigation: CompatNavigationProp<
      IOStackNavigationProp<WalletParamsList, "WALLET_SATISPAY_DETAIL">
    >;
  };

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
