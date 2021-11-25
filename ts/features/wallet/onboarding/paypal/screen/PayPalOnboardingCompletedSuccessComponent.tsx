import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import successImage from "../../../../../../img/pictograms/payment-completed.png";
import { confirmButtonProps } from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { GlobalState } from "../../../../../store/reducers/types";
import I18n from "../../../../../i18n";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { walletAddPaypalCompleted } from "../store/actions";
type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * this screen shows that the onboarding is completed successfully
 * footer button navigates to the PayPal method details
 * @param props
 * @constructor
 */
const PayPalOnboardingCompletedSuccessComponent = (props: Props) => (
  <>
    <InfoScreenComponent
      image={renderInfoRasterImage(successImage)}
      title={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.title")}
      body={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.body")}
    />
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(
        props.paypalOnboardingCompleted,
        I18n.t("wallet.onboarding.paypal.onBoardingCompleted.primaryButton"),
        undefined,
        "primaryButtonId"
      )}
    />
  </>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  paypalOnboardingCompleted: () => dispatch(walletAddPaypalCompleted())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalOnboardingCompletedSuccessComponent);
