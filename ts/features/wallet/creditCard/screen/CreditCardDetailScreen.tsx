import * as React from "react";

import {
  idpayInitiativesFromInstrumentRefreshEnd,
  idpayInitiativesFromInstrumentRefreshStart
} from "../../../idpay/wallet/store/actions";

import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import CreditCardComponent from "../component/CreditCardComponent";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { connect } from "react-redux";
import { creditCardByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { idPayAreInitiativesFromInstrumentLoadingSelector } from "../../../idpay/wallet/store/reducers";
import { useIOSelector } from "../../../../store/hooks";

export type CreditCardDetailScreenNavigationParams = Readonly<{
  // Since we don't have a typed ID for the payment methods, we keep the creditCard as param even if it is then read by the store
  creditCard: CreditCardPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  IOStackNavigationRouteProps<WalletParamsList, "WALLET_CREDIT_CARD_DETAIL">;

/**
 * Detail screen for a credit card
 * @constructor
 */
const CreditCardDetailScreen: React.FunctionComponent<Props> = props => {
  const [walletExisted, setWalletExisted] = React.useState(false);
  const { loadIdpayInitiatives, stopRefreshingInitiatives } = props;
  const paramCreditCard: CreditCardPaymentMethod =
    props.route.params.creditCard;
  // We need to read the card from the store to receive the updates
  // TODO: to avoid this we need a store refactoring for the wallet section (all the component should receive the id and not the wallet, in order to update when needed)
  const storeCreditCard = props.creditCardById(paramCreditCard.idWallet);

  const areIdPayInitiativesLoading = useIOSelector(
    idPayAreInitiativesFromInstrumentLoadingSelector
  );
  // This will set the flag `walletExisted` to true
  // if, during this component lifecycle, a card actually
  // existed in the state and has been removed. It's used to
  // prevent the show of the `WorkunitGenericFailure`.
  React.useEffect(() => {
    if (storeCreditCard) {
      setWalletExisted(true);
    }
  }, [storeCreditCard, setWalletExisted]);

  const isRefreshActiveRef = React.useRef(false);
  React.useEffect(() => {
    if (
      !isRefreshActiveRef.current &&
      storeCreditCard?.idWallet !== undefined
    ) {
      // eslint-disable-next-line functional/immutable-data
      isRefreshActiveRef.current = true;
      loadIdpayInitiatives(storeCreditCard?.idWallet.toString());
    }
    return () => {
      stopRefreshingInitiatives();
    };
  }, [storeCreditCard, loadIdpayInitiatives, stopRefreshingInitiatives]);

  return (
    <LoadingSpinnerOverlay
      isLoading={areIdPayInitiativesLoading}
      loadingOpacity={100}
    >
      {storeCreditCard ? (
        <BasePaymentMethodScreen
          paymentMethod={storeCreditCard}
          card={
            <CreditCardComponent
              testID={"CreditCardComponent"}
              creditCard={storeCreditCard}
            />
          }
          content={
            areIdPayInitiativesLoading ? null : (
              <PaymentMethodFeatures paymentMethod={storeCreditCard} />
            )
          }
        />
      ) : !walletExisted ? (
        <WorkunitGenericFailure />
      ) : null}
    </LoadingSpinnerOverlay>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadIdpayInitiatives: (idWallet: string) =>
    dispatch(
      idpayInitiativesFromInstrumentRefreshStart({
        idWallet,
        isRefreshCall: false
      })
    ),
  stopRefreshingInitiatives: () =>
    dispatch(idpayInitiativesFromInstrumentRefreshEnd)
});
const mapStateToProps = (state: GlobalState) => ({
  creditCardById: (id: number) => creditCardByIdSelector(state, id)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditCardDetailScreen);
