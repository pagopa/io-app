import React from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import paymentCompleted from "../../../img/pictograms/payment-completed.png";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import OutcomeCodeMessageComponent from "../../components/wallet/OutcomeCodeMessageComponent";
import I18n from "../../i18n";
import { navigateToWalletHome } from "../../store/actions/navigation";
import { GlobalState } from "../../store/reducers/types";
import {
  lastPaymentOutcomeCodeSelector,
  outcomeCodesSelector
} from "../../store/reducers/wallet/outcomeCode";
import { Wallet } from "../../types/pagopa";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { runDeleteActivePaymentSaga } from "../../store/actions/wallet/payment";

export type AddCreditCardOutcomeCodeMessageNavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps =
  NavigationStackScreenProps<AddCreditCardOutcomeCodeMessageNavigationParams>;
type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const successComponent = () => (
  <InfoScreenComponent
    image={renderInfoRasterImage(paymentCompleted)}
    title={I18n.t("wallet.outcomeMessage.addCreditCard.success.title")}
  />
);

/**
 * This is the wrapper component which takes care of showing the outcome message after that
 * a user tries to add a card to his/her wallet.
 * The component expects the action outcomeCodeRetrieved to be dispatched before being rendered,
 * so the pot.none case is not taken into account.
 *
 */
const AddCreditCardOutcomeCodeMessage: React.FC<Props> = (props: Props) => {
  /**
   * if the card insertion fails, run the procedure to delete the payment activation
   * even if there is no one running (that check is done by the relative saga)
   */
  useOnFirstRender(() => {
    if (props.paymentOutcome?.status !== "success") {
      props.deletePayment();
    }
  });

  return props.paymentOutcome ? (
    <OutcomeCodeMessageComponent
      outcomeCode={props.paymentOutcome}
      onClose={props.navigateToWalletHome}
      successComponent={successComponent}
    />
  ) : null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => navigateToWalletHome(),
  deletePayment: () => dispatch(runDeleteActivePaymentSaga())
});

const mapStateToProps = (state: GlobalState) => ({
  paymentOutcome:
    lastPaymentOutcomeCodeSelector(state).outcomeCode.toUndefined(),
  outcomeCodes: outcomeCodesSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddCreditCardOutcomeCodeMessage);
