import React from "react";
import { RefundOperationDTO } from "../../../../../../definitions/idpay/timeline/RefundOperationDTO";

type RefundDetailsProps = {
  refund: RefundOperationDTO;
};

const RefundDetailsComponent = (props: RefundDetailsProps) => {
  const { refund } = props;
  return <></>;
};

export { RefundDetailsComponent };
