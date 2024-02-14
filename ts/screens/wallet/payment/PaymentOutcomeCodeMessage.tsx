import { VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { View } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Route, useRoute } from "@react-navigation/native";
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import paymentCompleted from "../../../../img/pictograms/payment-completed.png";
import { cancelButtonProps } from "../../../components/buttons/ButtonConfigurations";
import { Label } from "../../../components/core/typography/Label";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import OutcomeCodeMessageComponent from "../../../components/wallet/OutcomeCodeMessageComponent";
import { WalletPaymentFeebackBanner } from "../../../features/walletV3/payment/components/WalletPaymentFeedbackBanner";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";
import I18n from "../../../i18n";
import { navigateToWalletHome } from "../../../store/actions/navigation";
import { backToEntrypointPayment } from "../../../store/actions/wallet/payment";
import { profileEmailSelector } from "../../../store/reducers/profile";
import { GlobalState } from "../../../store/reducers/types";
import { lastPaymentOutcomeCodeSelector } from "../../../store/reducers/wallet/outcomeCode";
import {
  entrypointRouteSelector,
  paymentVerificaSelector
} from "../../../store/reducers/wallet/payment";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import { openWebUrl } from "../../../utils/url";

export type PaymentOutcomeCodeMessageNavigationParams = Readonly<{
  fee: ImportoEuroCents;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const SuccessBody = ({ emailAddress }: { emailAddress: string }) => (
  <View>
    <Label
      weight={"Regular"}
      color={"bluegrey"}
      style={{ textAlign: "center" }}
    >
      {I18n.t("wallet.outcomeMessage.payment.success.description1")}
      <Label weight={"Bold"} color={"bluegrey"}>{`\n${emailAddress}\n`}</Label>
      {I18n.t("wallet.outcomeMessage.payment.success.description2")}
    </Label>
    <VSpacer size={16} />
    <View
      style={{
        // required to make the banner the correct width
        // since the InfoScreen component is reused in a lot of screens,
        // updating that would be a breaking change
        width: widthPercentageToDP("100%"),
        paddingHorizontal: 32
      }}
    >
      <WalletPaymentFeebackBanner />
    </View>
  </View>
);

const successComponent = (emailAddress: string, amount?: string) => (
  <InfoScreenComponent
    image={renderInfoRasterImage(paymentCompleted)}
    title={
      amount
        ? I18n.t("payment.paidConfirm", { amount })
        : I18n.t("wallet.outcomeMessage.payment.success.title")
    }
    body={<SuccessBody emailAddress={emailAddress} />}
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
  const { fee } =
    useRoute<
      Route<
        "PAYMENT_OUTCOMECODE_MESSAGE",
        PaymentOutcomeCodeMessageNavigationParams
      >
    >().params;
  const outcomeCode = O.toNullable(props.outcomeCode.outcomeCode);
  const learnMoreLink = "https://io.italia.it/faq/#pagamenti";
  const onLearnMore = () => openWebUrl(learnMoreLink);

  useHardwareBackButton(() => {
    props.navigateToWalletHome(props.shouldGoBackToEntrypointOnSuccess);
    return true;
  });

  const renderSuccessComponent = () => {
    if (pot.isSome(props.verifica)) {
      const totalAmount =
        (props.verifica.value.importoSingoloVersamento as number) +
        (fee as number);

      return successComponent(
        O.getOrElse(() => "")(props.profileEmail),
        formatNumberCentsToAmount(totalAmount, true)
      );
    } else {
      return successComponent(O.getOrElse(() => "")(props.profileEmail));
    }
  };

  return outcomeCode ? (
    <OutcomeCodeMessageComponent
      outcomeCode={outcomeCode}
      onClose={() =>
        props.navigateToWalletHome(props.shouldGoBackToEntrypointOnSuccess)
      }
      successComponent={renderSuccessComponent}
      successFooter={() =>
        successFooter(() =>
          props.navigateToWalletHome(props.shouldGoBackToEntrypointOnSuccess)
        )
      }
      onLearnMore={onLearnMore}
    />
  ) : null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: (shouldGoBackToEntrypointOnSuccess: boolean) =>
    shouldGoBackToEntrypointOnSuccess
      ? dispatch(backToEntrypointPayment())
      : navigateToWalletHome()
});

const mapStateToProps = (state: GlobalState) => ({
  shouldGoBackToEntrypointOnSuccess:
    entrypointRouteSelector(state)?.name === "PN_ROUTES_MESSAGE_DETAILS",
  outcomeCode: lastPaymentOutcomeCodeSelector(state),
  profileEmail: profileEmailSelector(state),
  verifica: paymentVerificaSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentOutcomeCodeMessage);
