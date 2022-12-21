import { Text as NBText } from "native-base";
import * as React from "react";
import { H1 } from "../../../../components/core/typography/H1";
import I18n from "../../../../i18n";

type Props = {
  title: string;
  isPrescription: boolean;
};

/**
 * Render a title for a message
 * @param props
 * @constructor
 */
export const MessageTitle = (props: Props): React.ReactElement =>
  props.isPrescription ? (
    <>
      <H1>{I18n.t("messages.medical.prescription")}</H1>
      <NBText>{I18n.t("messages.medical.memo")}</NBText>
    </>
  ) : (
    <H1>{props.title}</H1>
  );
