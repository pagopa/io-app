import { H3, H3 as NBH3, Text as NBText, View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import I18n from "../../../../i18n";
import { PrescriptionData } from "../../../../store/reducers/entities/messages/types";

type Props = {
  title: string;
  prescriptionData?: PrescriptionData;
};

/**
 * Render a title for a message
 * @param props
 * @constructor
 */
export const MessageTitle = (props: Props): React.ReactElement =>
  props.prescriptionData ? (
    <>
      <NBH3>{I18n.t("messages.medical.prescription")}</NBH3>
      <NBText>{I18n.t("messages.medical.memo")}</NBText>
    </>
  ) : (
    <H3>{props.title}</H3>
  );
