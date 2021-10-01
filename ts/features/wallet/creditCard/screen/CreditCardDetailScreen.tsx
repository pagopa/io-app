import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { GlobalState } from "../../../../store/reducers/types";
import { creditCardByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import CreditCardComponent from "../component/CreditCardComponent";

type NavigationParams = Readonly<{
  // Since we don't have a typed ID for the payment methods, we keep the creditCard as param even if it is then read by the store
  creditCard: CreditCardPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a credit card
 * @constructor
 */
const CreditCardDetailScreen: React.FunctionComponent<Props> = props => {
  const paramCreditCard: CreditCardPaymentMethod =
    props.navigation.getParam("creditCard");
  // We need to read the card from the store to receive the updates
  // TODO: to avoid this we need a store refactoring for the wallet section (all the component should receive the id and not the wallet, in order to update when needed)
  const storeCreditCard = props.creditCardById(paramCreditCard.idWallet);

  return storeCreditCard ? (
    <BasePaymentMethodScreen
      paymentMethod={storeCreditCard}
      card={
        <CreditCardComponent
          testID={"CreditCardComponent"}
          creditCard={storeCreditCard}
        />
      }
      content={<PaymentMethodFeatures paymentMethod={storeCreditCard} />}
    />
  ) : (
    <WorkunitGenericFailure />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  creditCardById: (id: number) => creditCardByIdSelector(state, id)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditCardDetailScreen);
