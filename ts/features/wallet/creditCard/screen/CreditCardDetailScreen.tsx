import * as React from "react";

import { connect } from "react-redux";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { GlobalState } from "../../../../store/reducers/types";
import { creditCardByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { idPayAreInitiativesFromInstrumentLoadingSelector } from "../../../idpay/wallet/store/reducers";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import CreditCardComponent from "../component/CreditCardComponent";

export type CreditCardDetailScreenNavigationParams = Readonly<{
  // Since we don't have a typed ID for the payment methods, we keep the creditCard as param even if it is then read by the store
  creditCard: CreditCardPaymentMethod;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  IOStackNavigationRouteProps<WalletParamsList, "WALLET_CREDIT_CARD_DETAIL">;

/**
 * Detail screen for a credit card
 * @constructor
 */
const CreditCardDetailScreen: React.FunctionComponent<Props> = props => {
  const [walletExisted, setWalletExisted] = React.useState(false);
  const paramCreditCard: CreditCardPaymentMethod =
    props.route.params.creditCard;
  const { areIdpayInitiativesLoading } = props;
  // We need to read the card from the store to receive the updates
  // TODO: to avoid this we need a store refactoring for the wallet section (all the component should receive the id and not the wallet, in order to update when needed)
  const storeCreditCard = props.creditCardById(paramCreditCard.idWallet);

  // This will set the flag `walletExisted` to true
  // if, during this component lifecycle, a card actually
  // existed in the state and has been removed. It's used to
  // prevent the show of the `WorkunitGenericFailure`.
  React.useEffect(() => {
    if (storeCreditCard) {
      setWalletExisted(true);
    }
  }, [storeCreditCard, setWalletExisted]);

  if (storeCreditCard !== undefined) {
    return (
      <LoadingSpinnerOverlay
        isLoading={areIdpayInitiativesLoading}
        loadingOpacity={100}
      >
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
      </LoadingSpinnerOverlay>
    );
  } else if (!walletExisted) {
    return <WorkunitGenericFailure />;
  }
  return null;
};

const mapStateToProps = (state: GlobalState) => ({
  areIdpayInitiativesLoading:
    idPayAreInitiativesFromInstrumentLoadingSelector(state),
  creditCardById: (id: number) => creditCardByIdSelector(state, id)
});
export default connect(mapStateToProps)(CreditCardDetailScreen);
