/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import * as t from "io-ts";
import { Option } from "fp-ts/lib/Option";
import Instabug from "instabug-reactnative";
import { RptId, RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import * as React from "react";
import { Image, ImageSourcePropType, SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { View } from "native-base";
import {
  instabugLog,
  openInstabugQuestionReport,
  setInstabugUserAttribute,
  TypeLogs
} from "../../../boot/configureInstabug";
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
import { GlobalState } from "../../../store/reducers/types";
import { PayloadForAction } from "../../../types/utils";
import {
  DetailV2Keys,
  getCodiceAvviso,
  getPaymentHistoryDetails,
  getV2ErrorMainType
} from "../../../utils/payment";
import { useHardwareBackButton } from "../../../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { H4 } from "../../../components/core/typography/H4";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
import { FooterStackButton } from "../../../features/bonus/bonusVacanze/components/buttons/FooterStackButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import {
  PaymentHistory,
  paymentsHistorySelector
} from "../../../store/reducers/payments/history";

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

const instabugTag = "payment-support";

// Save the rptId as attribute and open the Instabug chat.
const requestAssistanceForPaymentFailure = (
  rptId: RptId,
  payment?: PaymentHistory
) => {
  Instabug.appendTags([instabugTag]);
  setInstabugUserAttribute(
    "blockedPaymentRptId",
    RptIdFromString.encode(rptId)
  );
  if (payment) {
    instabugLog(getPaymentHistoryDetails(payment), TypeLogs.INFO, instabugTag);
  }
  openInstabugQuestionReport();
};


type ScreenUIContents = {
  image: ImageSourcePropType;
  title: string;
  footer: React.ReactNode;
  subtitle?: React.ReactNode;
};

const renderErrorCodeCopy = (error: DetailV2Keys): React.ReactNode => {
  const validError = t.keyof(Detail_v2Enum).decode(error);
  return validError.isRight() ? (
    <>
      <H4 weight={"Regular"}>{I18n.t("wallet.errors.assistanceLabel")}</H4>
      <H4 weight={"Bold"}>{error}</H4>
      <View spacer />
      <CopyButtonComponent textToCopy={error} />
    </>
  ) : null;
};

/**
 * Convert the error code into a user-readable string
 * @param maybeError
 * @param rptId
 * @param onCancel
 */
export const errorTransactionUIElements = (
  maybeError: NavigationParams["error"],
  rptId: RptId,
  onCancel: () => void,
  payment?: PaymentHistory
): ScreenUIContents => {
  const baseIconPath = "../../../../img/";
  const errorORUndefined = maybeError.toUndefined();

  if (errorORUndefined === "PAYMENT_ID_TIMEOUT") {
    return {
      image: require(baseIconPath +
        "wallet/errors/missing-payment-id-icon.png"),
      title: I18n.t("wallet.errors.MISSING_PAYMENT_ID"),
      footer: (
        <FooterStackButton
          buttons={[
            cancelButtonProps(onCancel, I18n.t("global.buttons.close"))
          ]}
        />
      )
    };
  }

  const requestAssistance = () =>
    requestAssistanceForPaymentFailure(rptId, payment);

  if (errorORUndefined) {
    const errorMacro = getV2ErrorMainType(errorORUndefined);

    switch (errorMacro) {
      case "TECHNICAL":
        return {
          image: require(baseIconPath + "servicesStatus/error-detail-icon.png"),
          title: I18n.t("wallet.errors.TECHNICAL"),
          subtitle: renderErrorCodeCopy(errorORUndefined),
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(
                  requestAssistance,
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
          subtitle: renderErrorCodeCopy(errorORUndefined),
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(onCancel, I18n.t("global.buttons.back")),
                cancelButtonProps(
                  requestAssistance,
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
          subtitle: renderErrorCodeCopy(errorORUndefined),
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(
                  requestAssistance,
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
          title: I18n.t("wallet.errors.DUPLICATED"),
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
          title: I18n.t("wallet.errors.ONGOING"),
          subtitle: (
            <H4 weight={"Regular"} style={{ textAlign: "center" }}>
              {I18n.t("wallet.errors.ONGOING_SUBTITLE")}
            </H4>
          ),
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(onCancel, I18n.t("global.buttons.close")),
                cancelButtonProps(
                  requestAssistance,
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
            <H4 weight={"Regular"} style={{ textAlign: "center" }}>
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
            <H4 weight={"Regular"} style={{ textAlign: "center" }}>
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
            <H4 weight={"Regular"} style={{ textAlign: "center" }}>
              {I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
            </H4>
          ),
          footer: (
            <FooterStackButton
              buttons={[
                confirmButtonProps(onCancel, I18n.t("global.buttons.close")),
                cancelButtonProps(
                  requestAssistance,
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
            requestAssistance,
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
  const { paymentsHistory } = props;

  const codiceAvviso = getCodiceAvviso(rptId);

  const payment = paymentsHistory.find(
    p => codiceAvviso === getCodiceAvviso(p.data)
  );

  const { title, subtitle, footer, image } = errorTransactionUIElements(
    error,
    rptId,
    onCancel,
    payment
  );
  const handleBackPress = () => {
    props.backToEntrypointPayment();
    return true;
  };

  useHardwareBackButton(handleBackPress);

  return (
    <BaseScreenComponent>
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
  paymentsHistory: paymentsHistorySelector(state)
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
