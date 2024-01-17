import React from "react";
import { UIMessageDetails } from "../../types";
import { getPaymentExpirationInfo } from "../../utils";
import DueDateBar from "./DueDateBar";

type HeaderDueDateBarProps = {
  messageDetails: UIMessageDetails;
  hasPaidBadge: boolean;
};

export const HeaderDueDateBar = ({
  hasPaidBadge,
  messageDetails
}: HeaderDueDateBarProps) => {
  const paymentExpirationInfo = getPaymentExpirationInfo(messageDetails);

  return (
    <>
      {messageDetails.dueDate !== undefined ? (
        <DueDateBar
          dueDate={messageDetails.dueDate}
          expirationInfo={paymentExpirationInfo}
          isPaid={hasPaidBadge}
        />
      ) : null}
    </>
  );
};
