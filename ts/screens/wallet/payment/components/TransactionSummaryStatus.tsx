import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View } from "react-native";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import StatusContent from "../../../../components/SectionStatus/StatusContent";
import I18n from "../../../../i18n";
import { getV2ErrorMainType } from "../../../../utils/payment";
import { TransactionSummaryError } from "../NewTransactionSummaryScreen";
import { IOIcons } from "../../../../components/core/icons";

type StatusContentProps = {
  viewRef: React.RefObject<View>;
  backgroundColor: "orange" | "aqua";
  iconName: IOIcons;
  foregroundColor: "white" | "bluegreyDark";
  line1: string;
  line2?: string;
};

export const renderStatusContent = (props: StatusContentProps) => (
  <StatusContent
    accessibilityRole={"alert"}
    backgroundColor={props.backgroundColor}
    foregroundColor={props.foregroundColor}
    iconName={props.iconName}
    viewRef={props.viewRef}
    labelPaddingVertical={props.line2 ? 4 : 14}
  >
    <LabelSmall color={props.foregroundColor} weight={"Regular"}>
      {props.line1}
    </LabelSmall>
    {props.line2 && (
      <LabelSmall color={props.foregroundColor} weight={"Bold"}>
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

  const errorOrUndefined = O.toUndefined(props.error);
  if (
    errorOrUndefined === "PAYMENT_ID_TIMEOUT" ||
    errorOrUndefined === undefined
  ) {
    return null;
  }

  const errorType = getV2ErrorMainType(errorOrUndefined);
  switch (errorType) {
    case "EC":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        foregroundColor: "white",
        iconName: "notice",
        line1: I18n.t("wallet.errors.TECHNICAL"),
        line2: I18n.t("wallet.errors.contactECsubtitle")
      };
      break;
    case "REVOKED":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        foregroundColor: "white",
        iconName: "notice",
        line1: I18n.t("wallet.errors.REVOKED"),
        line2: I18n.t("wallet.errors.contactECsubtitle")
      };
      break;
    case "EXPIRED":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        foregroundColor: "white",
        iconName: "notice",
        line1: I18n.t("wallet.errors.EXPIRED"),
        line2: I18n.t("wallet.errors.contactECsubtitle")
      };
      break;
    case "ONGOING":
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        foregroundColor: "white",
        iconName: "notice",
        line1: I18n.t("wallet.errors.ONGOING"),
        line2: I18n.t("wallet.errors.ONGOING_SUBTITLE")
      };
      break;
    case "DUPLICATED":
      statusContentProps = {
        viewRef,
        backgroundColor: "aqua",
        iconName: "ok",
        foregroundColor: "bluegreyDark",
        line1: I18n.t("wallet.errors.DUPLICATED")
      };
      break;
    default:
      statusContentProps = {
        viewRef,
        backgroundColor: "orange",
        iconName: "notice",
        foregroundColor: "white",
        line1: I18n.t("wallet.errors.TECHNICAL"),
        line2: I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")
      };
      break;
  }

  return renderStatusContent(statusContentProps);
};
