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
  if (messageDetails.dueDate === undefined) {
    return null;
  }

  return (
    <DueDateBar
      dueDate={messageDetails.dueDate}
      expirationInfo={getPaymentExpirationInfo(messageDetails)}
      isPaid={hasPaidBadge}
    />
  );
};
