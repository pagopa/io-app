import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { NavigationInjectedProps } from "react-navigation";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { lastPaymentOutcomeCodeSelector } from "../../store/reducers/wallet/outcomeCode";
import {
  navigateToWalletHome,
  navigateToWalletTransactionsScreen
} from "../../store/actions/navigation";
import OutcomeCodeMessageComponent from "../../components/wallet/OutcomeCodeMessageComponent";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import paymentCompleted from "../../../img/pictograms/payment-completed.png";
import { FooterTwoButtons } from "../../features/bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import { Wallet } from "../../types/pagopa";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;
type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const successComponent = () => (
  <InfoScreenComponent
    image={renderInfoRasterImage(paymentCompleted)}
    title={I18n.t("wallet.outcomeMessage.addCreditCard.success.title")}
  />
);

const successFooter = (onVisualize: () => void, onClose: () => void) => (
  <FooterTwoButtons
    onCancel={onClose}
    onRight={onVisualize}
    leftText={I18n.t("wallet.outcomeMessage.cta.close")}
    rightText={I18n.t("wallet.outcomeMessage.cta.visualizeCard")}
  />
);

/**
 * This is the wrapper component which takes care of showing the outcome message after that
 * a user tries to add a card to his/her wallet.
 * The component expects the action outcomeCodeRetrieved to be dispatched before being rendered,
 * so the pot.none case is not taken into account.
 *
 * If the outcome code is of type success the render a two buttons footer that allow the user to go to the wallet home
 * or to go to the added card details.
 */
const AddCreditCardOutcomeCodeMessage: React.FC<Props> = (props: Props) => {
  const selectedWallet = props.navigation.getParam("selectedWallet");
  const outcomeCode = props.outcomeCode.outcomeCode.fold(undefined, oC => oC);

  return outcomeCode ? (
    <OutcomeCodeMessageComponent
      outcomeCode={outcomeCode}
      onClose={props.navigateToWalletHome}
      successComponent={successComponent}
      successFooter={() =>
        successFooter(
          () => props.navigateToCreditCardDetails(selectedWallet),
          props.navigateToWalletHome
        )
      }
    />
  ) : null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome()),
  navigateToCreditCardDetails: (selectedWallet: Wallet) =>
    dispatch(navigateToWalletTransactionsScreen({ selectedWallet }))
});

const mapStateToProps = (state: GlobalState) => ({
  outcomeCode: lastPaymentOutcomeCodeSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddCreditCardOutcomeCodeMessage);
