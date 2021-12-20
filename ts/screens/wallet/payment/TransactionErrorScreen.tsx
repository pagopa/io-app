/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import * as t from "io-ts";
import { Option } from "fp-ts/lib/Option";
import Instabug from "instabug-reactnative";
import * as React from "react";
import { ComponentProps } from "react";
import { Image, ImageSourcePropType, SafeAreaView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { View } from "native-base";
import { RptId, RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
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
  ErrorTypes,
  getCodiceAvviso,
  getPaymentHistoryDetails,
  getV2ErrorMainType,
  paymentInstabugTag
} from "../../../utils/payment";
import { useHardwareBackButton } from "../../../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { H4 } from "../../../components/core/typography/H4";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
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
import { FooterStackButton } from "../../../features/bonus/bonusVacanze/components/buttons/FooterStackButtons";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus";
import {
  addTicketCustomField,
  appendLog,
  assistanceToolRemoteConfig,
  canShowHelp,
  zendeskBlockedPaymentRptIdId,
  zendeskCategoryId,
  zendeskPaymentCategoryValue
} from "../../../utils/supportAssistance";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { zendeskSupportStart } from "../../../features/zendesk/store/actions";
import {
  isProfileEmailValidatedSelector,
  profileSelector,
  ProfileState
} from "../../../store/reducers/profile";

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
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const baseIconPath = "../../../../img/";

const imageMapping: Record<ErrorTypes, ImageSourcePropType> = {
  DATA: require(baseIconPath + "pictograms/doubt.png"),
  DUPLICATED: require(baseIconPath + "pictograms/fireworks.png"),
  EC: require(baseIconPath + "wallet/errors/payment-unavailable-icon.png"),
  EXPIRED: require(baseIconPath + "servicesStatus/error-detail-icon.png"),
  ONGOING: require(baseIconPath + "pictograms/hourglass.png"),
  REVOKED: require(baseIconPath + "servicesStatus/error-detail-icon.png"),
  UNCOVERED: require(baseIconPath + "/wallet/errors/generic-error-icon.png"),
  TECHNICAL: require(baseIconPath + "servicesStatus/error-detail-icon.png")
};

// Save the rptId as attribute and open the Instabug chat.
const requestAssistanceForPaymentFailure = (
  rptId: RptId,
  payment?: PaymentHistory
) => {
  Instabug.appendTags([paymentInstabugTag]);
  setInstabugUserAttribute(
    "blockedPaymentRptId",
    RptIdFromString.encode(rptId)
  );
  if (payment) {
    instabugLog(
      getPaymentHistoryDetails(payment),
      TypeLogs.INFO,
      paymentInstabugTag
    );
  }
  openInstabugQuestionReport();
};

const requestZendeskAssistanceForPaymentFailure = (
  rptId: RptId,
  payment?: PaymentHistory
) => {
  // Set pagamenti_pagopa as category
  addTicketCustomField(zendeskCategoryId, zendeskPaymentCategoryValue);
  // Add rptId custom field
  addTicketCustomField(
    zendeskBlockedPaymentRptIdId,
    RptIdFromString.encode(rptId)
  );
  if (payment) {
    // Append the payment history details in the log
    appendLog(getPaymentHistoryDetails(payment));
  }
};
type ScreenUIContents = {
  image: ImageSourcePropType;
  title: string;
  subtitle?: React.ReactNode;
  footerButtons?: ComponentProps<typeof FooterStackButton>["buttons"];
};

const ErrorCodeCopyComponent = ({
  error
}: {
  error: keyof typeof Detail_v2Enum;
}): React.ReactElement => (
  <View testID={"error-code-copy-component"}>
    <H4 weight={"Regular"}>{I18n.t("wallet.errors.assistanceLabel")}</H4>
    <H4 weight={"Bold"} testID={"error-code"} style={{ textAlign: "center" }}>
      {error}
    </H4>
    <View spacer />
    <CopyButtonComponent textToCopy={error} />
  </View>
);

const canShowHelpButton = (
  choosenTool: ToolEnum,
  profile: ProfileState,
  isProfileEmailValidated: boolean
): boolean =>
  canShowHelp(choosenTool, !pot.isSome(profile) || isProfileEmailValidated);

/**
 * Convert the error code into a user-readable string
 * @param maybeError
 * @param rptId
 * @param onCancel
 * @param choosenTool
 * @param paymentHistory
 * @param canShowHelpButton
 * @param handleZendeskRequestAssistance
 */
export const errorTransactionUIElements = (
  maybeError: NavigationParams["error"],
  rptId: RptId,
  onCancel: () => void,
  choosenTool: ToolEnum,
  handleZendeskRequestAssistance: () => void,
  canShowHelpButton: boolean,
  paymentHistory?: PaymentHistory
): ScreenUIContents => {
  const errorORUndefined = maybeError.toUndefined();

  if (errorORUndefined === "PAYMENT_ID_TIMEOUT") {
    return {
      image: require(baseIconPath +
        "wallet/errors/missing-payment-id-icon.png"),
      title: I18n.t("wallet.errors.MISSING_PAYMENT_ID")
    };
  }
  const requestAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.instabug:
        requestAssistanceForPaymentFailure(rptId, paymentHistory);
        break;
      case ToolEnum.zendesk:
        requestZendeskAssistanceForPaymentFailure(rptId, paymentHistory);
        handleZendeskRequestAssistance();
        break;
      default:
        return;
    }
  };

  const errorMacro = getV2ErrorMainType(errorORUndefined);
  const validError = t.keyof(Detail_v2Enum).decode(errorORUndefined);
  const genericErrorSubTestID = "generic-error-subtitle";
  const subtitle = validError.fold(
    _ => (
      <H4 weight={"Regular"} testID={genericErrorSubTestID}>
        {I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
      </H4>
    ),
    error => <ErrorCodeCopyComponent error={error} />
  );

  const image = errorMacro
    ? imageMapping[errorMacro]
    : require(baseIconPath + "/wallet/errors/generic-error-icon.png");

  const sendReportButtonConfirm = [
    confirmButtonProps(
      requestAssistance,
      I18n.t("wallet.errors.sendReport"),
      undefined,
      "sendReportButtonConfirm"
    )
  ];
  const sendReportButtonCancel = [
    cancelButtonProps(
      requestAssistance,
      I18n.t("wallet.errors.sendReport"),
      undefined,
      "sendReportButtonCancel"
    )
  ];
  const closeButtonCancel = [
    cancelButtonProps(
      onCancel,
      I18n.t("global.buttons.close"),
      undefined,
      "closeButtonCancel"
    )
  ];
  const closeButtonConfirm = [
    confirmButtonProps(
      onCancel,
      I18n.t("global.buttons.close"),
      undefined,
      "closeButtonConfirm"
    )
  ];

  switch (errorMacro) {
    case "TECHNICAL":
      return {
        image,
        title: I18n.t("wallet.errors.TECHNICAL"),
        subtitle,
        footerButtons: canShowHelpButton
          ? [...sendReportButtonConfirm, ...closeButtonCancel]
          : [...closeButtonCancel]
      };
    case "DATA":
      return {
        image,
        title: I18n.t("wallet.errors.DATA"),
        subtitle,
        footerButtons: canShowHelpButton
          ? [...closeButtonConfirm, ...sendReportButtonCancel]
          : [...closeButtonConfirm]
      };
    case "EC":
      return {
        image,
        title: I18n.t("wallet.errors.EC"),
        subtitle,
        footerButtons: canShowHelpButton
          ? [...sendReportButtonConfirm, ...closeButtonCancel]
          : [...closeButtonCancel]
      };
    case "DUPLICATED":
      return {
        image,
        title: I18n.t("wallet.errors.DUPLICATED"),
        footerButtons: [...closeButtonCancel]
      };
    case "ONGOING":
      return {
        image,
        title: I18n.t("wallet.errors.ONGOING"),
        subtitle: (
          <H4
            weight={"Regular"}
            style={{ textAlign: "center" }}
            testID={"ongoing-subtitle"}
          >
            {I18n.t("wallet.errors.ONGOING_SUBTITLE")}
          </H4>
        ),
        footerButtons: canShowHelpButton
          ? [...closeButtonConfirm, ...sendReportButtonCancel]
          : [...closeButtonConfirm]
      };
    case "EXPIRED":
      return {
        image,
        title: I18n.t("wallet.errors.EXPIRED"),
        subtitle: (
          <H4
            weight={"Regular"}
            style={{ textAlign: "center" }}
            testID={"expired-subtitle"}
          >
            {I18n.t("wallet.errors.contactECsubtitle")}
          </H4>
        ),
        footerButtons: [...closeButtonCancel]
      };
    case "REVOKED":
      return {
        image,
        title: I18n.t("wallet.errors.REVOKED"),
        subtitle: (
          <H4
            weight={"Regular"}
            style={{ textAlign: "center" }}
            testID={"revoked-subtitle"}
          >
            {I18n.t("wallet.errors.contactECsubtitle")}
          </H4>
        ),
        footerButtons: [...closeButtonCancel]
      };
    case "UNCOVERED":
    default:
      return {
        image,
        title: I18n.t("wallet.errors.GENERIC_ERROR"),
        subtitle: (
          <H4 weight={"Regular"} testID={genericErrorSubTestID}>
            {I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
          </H4>
        ),
        footerButtons: canShowHelpButton
          ? [...closeButtonConfirm, ...sendReportButtonCancel]
          : [...closeButtonConfirm]
      };
  }
};

const TransactionErrorScreen = (props: Props) => {
  const rptId = props.navigation.getParam("rptId");
  const error = props.navigation.getParam("error");
  const onCancel = props.navigation.getParam("onCancel");
  const { paymentsHistory } = props;

  const codiceAvviso = getCodiceAvviso(rptId);
  const organizationFiscalCode = rptId.organizationFiscalCode;

  const paymentHistory = paymentsHistory.find(
    p =>
      codiceAvviso === getCodiceAvviso(p.data) &&
      organizationFiscalCode === p.data.organizationFiscalCode
  );

  const choosenTool = assistanceToolRemoteConfig(props.assistanceToolConfig);
  const { title, subtitle, footerButtons, image } = errorTransactionUIElements(
    error,
    rptId,
    onCancel,
    choosenTool,
    props.zendeskSupportWorkunitStart,
    canShowHelpButton(
      choosenTool,
      props.profile,
      props.isProfileEmailValidated
    ),
    paymentHistory
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
        {footerButtons && <FooterStackButton buttons={footerButtons} />}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  paymentsHistory: paymentsHistorySelector(state),
  assistanceToolConfig: assistanceToolConfigSelector(state),
  profile: profileSelector(state),
  isProfileEmailValidated: isProfileEmailValidatedSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPaymentManualDataInsertion: (isInvalidAmount: boolean) =>
    navigateToPaymentManualDataInsertion({ isInvalidAmount }),
  backToEntrypointPayment: () => dispatch(backToEntrypointPayment()),
  zendeskSupportWorkunitStart: () =>
    dispatch(
      zendeskSupportStart({ startingRoute: "n/a", assistanceForPayment: true })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionErrorScreen);
