import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import paymentCompleted from "../../../img/pictograms/payment-completed.png";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import OutcomeCodeMessageComponent from "../../components/wallet/OutcomeCodeMessageComponent";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../navigation/params/WalletParamsList";
import { navigateToWalletHome } from "../../store/actions/navigation";
import { GlobalState } from "../../store/reducers/types";
import { lastPaymentOutcomeCodeSelector } from "../../store/reducers/wallet/outcomeCode";
import { Wallet } from "../../types/pagopa";

export type AddCreditCardOutcomeCodeMessageNavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = {
  navigation: IOStackNavigationRouteProps<
    WalletParamsList,
    "ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE"
  >;
};
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
  const outcomeCode = pipe(props.outcomeCode.outcomeCode, O.toUndefined);

  return outcomeCode ? (
    <OutcomeCodeMessageComponent
      outcomeCode={outcomeCode}
      onClose={props.navigateToWalletHome}
      successComponent={successComponent}
    />
  ) : null;
};

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToWalletHome: () => navigateToWalletHome()
});

const mapStateToProps = (state: GlobalState) => ({
  outcomeCode: lastPaymentOutcomeCodeSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddCreditCardOutcomeCodeMessage);
