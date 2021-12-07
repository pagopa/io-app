import { H3, H3 as NBH3, Text as NBText } from "native-base";
import * as React from "react";
import I18n from "../../../../../i18n";

type Props = {
  title: string;
  isPrescriptionData: boolean;
};

/**
 * Render a title for a message
 * @param props
 * @constructor
 */
export const MessageTitle = (props: Props): React.ReactElement =>
  props.isPrescriptionData ? (
    <>
      <NBH3>{I18n.t("messages.medical.prescription")}</NBH3>
      <NBText>{I18n.t("messages.medical.memo")}</NBText>
    </>
  ) : (
    <H3>{props.title}</H3>
  );
