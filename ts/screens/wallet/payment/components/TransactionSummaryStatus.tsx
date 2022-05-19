import * as React from "react";
import { View } from "react-native";
import StatusContent from "../../../../components/SectionStatus/StatusContent";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { getV2ErrorMainType } from "../../../../utils/payment";
import { TransactionSummaryError } from "../NewTransactionSummaryScreen";

type StatusContentProps = {
  viewRef: React.RefObject<View>;
  backgroundColor: "orange" | "aqua";
  iconName: string;
  iconColor: string;
  labelColor: "white" | "bluegreyDark";
  line1: string;
  line2?: string;
};

export const renderStatusContent = (props: StatusContentProps) => (
  <StatusContent
    backgroundColor={props.backgroundColor}
    iconColor={props.iconColor}
    iconName={props.iconName}
    labelColor={props.labelColor}
    viewRef={props.viewRef}
  >
    <LabelSmall color={props.labelColor} weight={"Regular"}>
      {props.line1}
    </LabelSmall>
    {props.line2 && (
      <LabelSmall color={props.labelColor} weight={"Bold"}>
        {"\n"}
        {props.line2}
      </LabelSmall>
    )}
  </StatusContent>
);

export const TransactionSummaryStatus = (props: {
  error: TransactionSummaryError;
}) => {
  const viewRef = React.createRef<View>();

  // eslint-disable-next-line functional/no-let
  let statusContentProps: StatusContentProps | undefined;

  const errorOrUndefined = props.error.toUndefined();
  if (
    errorOrUndefined === "PAYMENT_ID_TIMEOUT" ||
    errorOrUndefined === undefined
  ) {
    return <></>;
  }

  const errorType = getV2ErrorMainType(errorOrUndefined);
  switch (errorType) {
    case "EC":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        labelColor: "white",
        iconName: "io-notice",
        iconColor: IOColors.white,
        line1: I18n.t("wallet.errors.TECHNICAL"),
        line2: I18n.t("wallet.errors.contactECsubtitle")
      };
      break;
    case "REVOKED":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        labelColor: "white",
        iconName: "io-notice",
        iconColor: IOColors.white,
        line1: I18n.t("wallet.errors.REVOKED"),
        line2: I18n.t("wallet.errors.contactECsubtitle")
      };
      break;
    case "EXPIRED":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        labelColor: "white",
        iconName: "io-notice",
        iconColor: IOColors.white,
        line1: I18n.t("wallet.errors.EXPIRED"),
        line2: I18n.t("wallet.errors.contactECsubtitle")
      };
      break;
    case "ONGOING":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        labelColor: "white",
        iconName: "io-notice",
        iconColor: IOColors.white,
        line1: I18n.t("wallet.errors.ONGOING"),
        line2: I18n.t("wallet.errors.ONGOING_SUBTITLE")
      };
      break;
    case "DUPLICATED":
      statusContentProps = {
        viewRef,
        backgroundColor: "aqua",
        iconName: "io-complete",
        iconColor: IOColors.bluegreyDark,
        labelColor: "bluegreyDark",
        line1: I18n.t("wallet.errors.DUPLICATED")
      };
      break;
    default:
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        iconName: "io-notice",
        iconColor: IOColors.white,
        labelColor: "white",
        line1: I18n.t("wallet.errors.TECHNICAL"),
        line2: I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")
      };
      break;
  }

  return renderStatusContent(statusContentProps);
};
