import * as React from "react";
import {
  PrescriptionData,
  UIMessageDetails
} from "../../../../../store/reducers/entities/messages/types";
import { MessagePaymentExpirationInfo } from "../../../../../utils/messages";
import MedicalPrescriptionIdentifiersComponent from "../../../MedicalPrescriptionIdentifiersComponent";
import DueDateBar from "../DueDateBar";
import MedicalPrescriptionDueDateBar from "../MedicalPrescriptionDueDateBar";

type Props = {
  prescriptionData?: PrescriptionData;
  dueDate?: Date;
  paymentExpirationInfo: MessagePaymentExpirationInfo;
  messageDetails: UIMessageDetails;
  hasPaidBadge: boolean;
};

/**
 * Groups all the possible combination of DueDate bars based (or not) on the prescriptionData
 * @param props
 * @constructor
 */
export const HeaderDueDateBar = (props: Props): React.ReactElement => (
  <>
    {props.prescriptionData && (
      <MedicalPrescriptionIdentifiersComponent
        prescriptionData={props.prescriptionData}
      />
    )}

    {props.prescriptionData === undefined && props.dueDate !== undefined && (
      <DueDateBar
        dueDate={props.dueDate}
        expirationInfo={props.paymentExpirationInfo}
        isPaid={props.hasPaidBadge}
      />
    )}

    {props.prescriptionData !== undefined && props.dueDate !== undefined && (
      <MedicalPrescriptionDueDateBar
        dueDate={props.dueDate}
        messageDetails={props.messageDetails}
        paymentExpirationInfo={props.paymentExpirationInfo}
      />
    )}
  </>
);
