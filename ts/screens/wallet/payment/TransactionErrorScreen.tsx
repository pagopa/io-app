/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import { Option } from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import { RptId, RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import * as React from "react";
import { Image, ImageSourcePropType, SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { View } from "native-base";
import { setInstabugUserAttribute } from "../../../boot/configureInstabug";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { navigateToPaymentManualDataInsertion } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  backToEntrypointPayment,
  paymentAttiva,
  paymentIdPolling,
  paymentVerifica
} from "../../../store/actions/wallet/payment";
import { paymentsLastDeletedStateSelector } from "../../../store/reducers/payments/lastDeleted";
import { GlobalState } from "../../../store/reducers/types";
import { PayloadForAction } from "../../../types/utils";
import { getV2ErrorMacro } from "../../../utils/payment";
import { useHardwareBackButton } from "../../../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { H4 } from "../../../components/core/typography/H4";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
import { FooterStackButton } from "../../../features/bonus/bonusVacanze/components/buttons/FooterStackButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../components/core/variables/IOStyles";

type NavigationParams = {
  error: Option<
    PayloadForAction<
      | typeof paymentVerifica["failure"]
      | typeof paymentAttiva["failure"]
      | typeof paymentIdPolling["failure"]
    >
  >;
  rptId: RptId;
  onCancel: () => void;
  onRetry: () => void;
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// Save the rptId as attribute and open the Instabug chat.
const sendPaymentBlockedBug = (rptId: RptId) => {
  setInstabugUserAttribute(
    "blockedPaymentRptId",
    RptIdFromString.encode(rptId)
  );
  BugReporting.showWithOptions(BugReporting.reportType.bug, [
    BugReporting.option.commentFieldRequired
  ]);
};

type ScreenUIContents = {
  image: ImageSourcePropType;
  title: string;
  subtitle: React.ReactElement;
  footer: React.ReactElement;
};

const ErrorCodeCopyComponent = ({
  error
}: {
  error: keyof typeof Detail_v2Enum;
}): React.ReactElement => (
  <>
    <H4 weight={"Regular"}>{"Codice per l'assistenza"}</H4>
    <H4 weight={"Bold"}>{error}</H4>
    <View spacer />
    <CopyButtonComponent textToCopy={error} />
  </>
);

/**
 * Convert the error code into a user-readable string
 * @param error
 */
export const errorTransactionUIElements = (
  maybeError: NavigationParams["error"],
  rptId: RptId,
  onCancel: () => void
): ScreenUIContents => {
  const baseIconPath = "../../../../img/";
  const errorORUndefined = maybeError.toUndefined();

  if (errorORUndefined === "PAYMENT_ID_TIMEOUT") {
    return {
      image: require(baseIconPath +
        "wallet/errors/missing-payment-id-icon.png"),
      title: I18n.t("wallet.errors.MISSING_PAYMENT_ID"),
      subtitle: <></>,
      footer: <></>
    };
  }

  const errorMacro = getV2ErrorMacro(errorORUndefined);

  if (errorORUndefined) {
    switch (errorMacro) {
      case "TECHNICAL":
        return {
          image: require(baseIconPath + "servicesStatus/error-detail-icon.png"),
          title: I18n.t("wallet.errors.TECHNICAL"),
          subtitle: <ErrorCodeCopyComponent error={errorORUndefined} />,
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(
                  () => sendPaymentBlockedBug(rptId),
                  I18n.t("wallet.errors.sendReport")
                ),
                cancelButtonProps(onCancel, I18n.t("global.buttons.close"))
              ]}
            />
          )
        };
      case "DATA":
        return {
          image: require(baseIconPath + "pictograms/doubt.png"),
          title: I18n.t("wallet.errors.DATA"),
          subtitle: <ErrorCodeCopyComponent error={errorORUndefined} />,
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(onCancel, I18n.t("global.buttons.back")),
                cancelButtonProps(
                  () => sendPaymentBlockedBug(rptId),
                  I18n.t("wallet.errors.sendReport")
                )
              ]}
            />
          )
        };
      case "EC":
        return {
          image: require(baseIconPath +
            "wallet/errors/payment-unavailable-icon.png"),
          title: I18n.t("wallet.errors.EC"),
          subtitle: <ErrorCodeCopyComponent error={errorORUndefined} />,
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(
                  () => sendPaymentBlockedBug(rptId),
                  I18n.t("wallet.errors.sendReport")
                ),
                cancelButtonProps(onCancel, I18n.t("global.buttons.close"))
              ]}
            />
          )
        };
      case "DUPLICATED":
        return {
          image: require(baseIconPath + "pictograms/fireworks.png"),
          title: I18n.t("wallet.errors.PAYMENT_DUPLICATED"),
          subtitle: <></>,
          footer: (
            <FooterStackButton
              buttons={[
                cancelButtonProps(onCancel, I18n.t("global.buttons.close"))
              ]}
            />
          )
        };
      case "ONGOING":
        return {
          image: require(baseIconPath + "pictograms/hourglass.png"),
          title: I18n.t("wallet.errors.PAYMENT_ONGOING"),
          subtitle: (
            <H4 weight={"Regular"}>
              {I18n.t("wallet.errors.ONGOING_SUBTITLE")}
            </H4>
          ),
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(onCancel, I18n.t("global.buttons.close")),
                cancelButtonProps(
                  () => sendPaymentBlockedBug(rptId),
                  I18n.t("wallet.errors.sendReport")
                )
              ]}
            />
          )
        };
      case "EXPIRED":
        return {
          image: require(baseIconPath + "servicesStatus/error-detail-icon.png"),
          title: I18n.t("wallet.errors.EXPIRED"),
          subtitle: (
            <H4 weight={"Regular"}>
              {I18n.t("wallet.errors.contactECsubtitle")}
            </H4>
          ),
          footer: (
            <FooterStackButton
              buttons={[
                cancelButtonProps(onCancel, I18n.t("global.buttons.close"))
              ]}
            />
          )
        };
      case "REVOKED":
        return {
          image: require(baseIconPath + "servicesStatus/error-detail-icon.png"),
          title: I18n.t("wallet.errors.REVOKED"),
          subtitle: (
            <H4 weight={"Regular"}>
              {I18n.t("wallet.errors.contactECsubtitle")}
            </H4>
          ),
          footer: (
            <FooterStackButton
              buttons={[
                cancelButtonProps(onCancel, I18n.t("global.buttons.close"))
              ]}
            />
          )
        };
      case "UNCOVERED":
      default:
        return {
          image: require(baseIconPath +
            "/wallet/errors/generic-error-icon.png"),
          title: I18n.t("wallet.errors.GENERIC_ERROR"),
          subtitle: (
            <H4 weight={"Regular"}>
              {I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
            </H4>
          ),
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(onCancel, I18n.t("global.buttons.close")),
                cancelButtonProps(
                  () => sendPaymentBlockedBug(rptId),
                  I18n.t("wallet.errors.sendReport")
                )
              ]}
            />
          )
        };
    }
  }
  return {
    image: require(baseIconPath + "/wallet/errors/generic-error-icon.png"),
    title: I18n.t("wallet.errors.GENERIC_ERROR"),
    subtitle: (
      <H4 weight={"Regular"}>
        {I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
      </H4>
    ),
    footer: (
      <FooterStackButton
        buttons={[
          confirmButtonProps(onCancel, I18n.t("global.buttons.close")),
          cancelButtonProps(
            () => sendPaymentBlockedBug(rptId),
            I18n.t("wallet.errors.sendReport")
          )
        ]}
      />
    )
  };
};

const TransactionErrorScreen = (props: Props) => {
  const rptId = props.navigation.getParam("rptId");
  const error = props.navigation.getParam("error");
  const onCancel = props.navigation.getParam("onCancel");

  const { title, subtitle, footer, image } = errorTransactionUIElements(
    error,
    rptId,
    onCancel
  );

  const handleBackPress = () => {
    props.backToEntrypointPayment();
    return true;
  };

  useHardwareBackButton(handleBackPress);

  return (
    <BaseScreenComponent
      goBack={onCancel}
      headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={<Image source={image} />}
          title={title}
          body={subtitle}
        />
        {footer}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  lastDeleted: paymentsLastDeletedStateSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPaymentManualDataInsertion: (isInvalidAmount: boolean) =>
    dispatch(navigateToPaymentManualDataInsertion({ isInvalidAmount })),
  backToEntrypointPayment: () => dispatch(backToEntrypointPayment())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionErrorScreen);
