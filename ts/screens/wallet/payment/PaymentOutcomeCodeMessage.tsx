import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import paymentCompleted from "../../../../img/pictograms/payment-completed.png";
import { Banner } from "../../../components/Banner";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Label } from "../../../components/core/typography/Label";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import OutcomeCodeMessageComponent from "../../../components/wallet/OutcomeCodeMessageComponent";
import { cancelButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import { navigateToWalletHome } from "../../../store/actions/navigation";
import { profileEmailSelector } from "../../../store/reducers/profile";
import { GlobalState } from "../../../store/reducers/types";
import { lastPaymentOutcomeCodeSelector } from "../../../store/reducers/wallet/outcomeCode";
import { paymentVerificaSelector } from "../../../store/reducers/wallet/payment";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import { openWebUrl } from "../../../utils/url";

export type PaymentOutcomeCodeMessageNavigationParams = Readonly<{
  fee: ImportoEuroCents;
}>;

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "PAYMENT_OUTCOMECODE_MESSAGE"
>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const SuccessBody = ({ emailAddress }: { emailAddress: string }) => {
  const handleBannerPress = () =>
    openAuthenticationSession("https://www.google.com", "");
  const viewRef = React.useRef<View>(null);
  return (
    <View>
      <Label
        weight={"Regular"}
        color={"bluegrey"}
        style={{ textAlign: "center" }}
      >
        {I18n.t("wallet.outcomeMessage.payment.success.description1")}
        <Label
          weight={"Bold"}
          color={"bluegrey"}
        >{`\n${emailAddress}\n`}</Label>
        {I18n.t("wallet.outcomeMessage.payment.success.description2")}
      </Label>
      <VSpacer size={16} />
      <Banner
        color="neutral"
        pictogramName="donation"
        variant="big"
        viewRef={viewRef}
        title="SURVEY"
        content="MAKE SURVEY"
        action="GO TO SURVEY"
        onPress={handleBannerPress}
      ></Banner>
    </View>
  );
};

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
  const outcomeCode = O.toNullable(props.outcomeCode.outcomeCode);
  const learnMoreLink = "https://io.italia.it/faq/#pagamenti";
  const onLearnMore = () => openWebUrl(learnMoreLink);

  const renderSuccessComponent = () => {
    if (pot.isSome(props.verifica)) {
      const totalAmount =
        (props.verifica.value.importoSingoloVersamento as number) +
        (props.route.params.fee as number);

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
      onClose={props.navigateToWalletHome}
      successComponent={renderSuccessComponent}
      successFooter={() => successFooter(props.navigateToWalletHome)}
      onLearnMore={onLearnMore}
    />
  ) : null;
};

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToWalletHome: () => navigateToWalletHome()
});

const mapStateToProps = (state: GlobalState) => ({
  outcomeCode: lastPaymentOutcomeCodeSelector(state),
  profileEmail: profileEmailSelector(state),
  verifica: paymentVerificaSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentOutcomeCodeMessage);
