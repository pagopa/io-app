import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import {
  lastPaymentOutcomeCodeSelector,
  paymentSelector
} from "../../../store/reducers/wallet/outcomeCode";
import { navigateToWalletHome } from "../../../store/actions/navigation";
import OutcomeCodeMessageComponent from "../../../components/wallet/OutcomeCodeMessageComponent";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import paymentCompleted from "../../../../img/pictograms/payment-completed.png";
import { cancelButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { Label } from "../../../components/core/typography/Label";
import { profileEmailSelector } from "../../../store/reducers/profile";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const successBody = (emailAddress: string) => (
  <Label weight={"Regular"} color={"bluegrey"} style={{ textAlign: "center" }}>
    {I18n.t("wallet.outcomeMessage.payment.success.description1")}
    <Label weight={"Bold"} color={"bluegrey"}>{`\n${emailAddress}\n`}</Label>
    {I18n.t("wallet.outcomeMessage.payment.success.description2")}
  </Label>
);

const successComponent = (emailAddress: string, amount: string) => (
  <InfoScreenComponent
    image={renderInfoRasterImage(paymentCompleted)}
    title={`${I18n.t("payment.paidConfirm")} ${amount}`}
    body={successBody(emailAddress)}
  />
);

const successFooter = (onClose: () => void) => (
  <FooterWithButtons
    type={"SingleButton"}
    leftButton={cancelButtonProps(
      onClose,
      I18n.t("wallet.outcomeMessage.cta.close")
    )}
  />
);

/**
 * This is the wrapper component which takes care of showing the outcome message after that
 * a user makes a payment.
 * The component expects the action outcomeCodeRetrieved to be dispatched before being rendered,
 * so the pot.none case is not taken into account.
 *
 * If the outcome code is of type success the render a single buttons footer that allow the user to go to the wallet home.
 */
const PaymentOutcomeCodeMessage: React.FC<Props> = (props: Props) => {
  const outcomeCode = props.outcomeCode.outcomeCode.fold(undefined, oC => oC);

  const { psps, verifica } = props.payment;

  const totalAmount =
    (verifica.value.importoSingoloVersamento as number) +
    (psps.value[0].fixedCost.amount as number);

  return outcomeCode ? (
    <OutcomeCodeMessageComponent
      outcomeCode={outcomeCode}
      onClose={props.navigateToWalletHome}
      successComponent={() =>
        successComponent(
          props.profileEmail.getOrElse(""),
          formatNumberCentsToAmount(totalAmount, true)
        )
      }
      successFooter={() => successFooter(props.navigateToWalletHome)}
    />
  ) : null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome())
});

const mapStateToProps = (state: GlobalState) => ({
  outcomeCode: lastPaymentOutcomeCodeSelector(state),
  profileEmail: profileEmailSelector(state),
  payment: paymentSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentOutcomeCodeMessage);
