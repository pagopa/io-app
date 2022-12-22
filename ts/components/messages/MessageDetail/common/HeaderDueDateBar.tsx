import * as React from "react";
import {
  getPaymentExpirationInfo,
  UIMessageDetails
} from "../../../../store/reducers/entities/messages/types";
import DueDateBar from "../DueDateBar";
import MedicalPrescriptionDueDateBar from "../MedicalPrescriptionDueDateBar";
import MedicalPrescriptionIdentifiersComponent from "./MedicalPrescriptionIdentifiersComponent";

type Props = {
  messageDetails: UIMessageDetails;
  hasPaidBadge: boolean;
};

/**
 * Groups all the possible combination of DueDate bars based (or not) on the prescriptionData
 * @param props
 * @constructor
 */
export const HeaderDueDateBar = (props: Props): React.ReactElement => {
  const paymentExpirationInfo = getPaymentExpirationInfo(props.messageDetails);

  return (
    <>
      {props.messageDetails.prescriptionData && (
        <MedicalPrescriptionIdentifiersComponent
          prescriptionData={props.messageDetails.prescriptionData}
        />
      )}

      {props.messageDetails.dueDate !== undefined &&
        (props.messageDetails.prescriptionData === undefined ? (
          <DueDateBar
            dueDate={props.messageDetails.dueDate}
            expirationInfo={paymentExpirationInfo}
            isPaid={props.hasPaidBadge}
          />
        ) : (
          <MedicalPrescriptionDueDateBar
            dueDate={props.messageDetails.dueDate}
            messageDetails={props.messageDetails}
            paymentExpirationInfo={paymentExpirationInfo}
          />
        ))}
    </>
  );
};
