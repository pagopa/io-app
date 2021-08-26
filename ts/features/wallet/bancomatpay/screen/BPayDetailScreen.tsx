import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { BPayPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import BPayCard from "../component/BPayCard";

type NavigationParams = Readonly<{
  bPay: BPayPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a Bancomat Pay
 * @constructor
 */
const BPayDetailScreen: React.FunctionComponent<Props> = props => {
  const bPay: BPayPaymentMethod = props.navigation.getParam("bPay");
  return (
    <BasePaymentMethodScreen
      paymentMethod={bPay}
      card={
        <BPayCard
          phone={bPay.info.numberObfuscated}
          bankName={bPay.caption}
          abiLogo={bPay.abiInfo?.logoUrl}
        />
      }
      content={<PaymentMethodFeatures paymentMethod={bPay} />}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BPayDetailScreen);
