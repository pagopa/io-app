import { CompatNavigationProp } from "@react-navigation/compat";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { GlobalState } from "../../../../store/reducers/types";
import { PrivativePaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import BasePrivativeCard from "../component/card/BasePrivativeCard";

export type PrivativeDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  privative: PrivativePaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    navigation: CompatNavigationProp<
      IOStackNavigationProp<WalletParamsList, "WALLET_PRIVATIVE_DETAIL">
    >;
  };

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
          blurredNumber={privative.info.blurredNumber}
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
