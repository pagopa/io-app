import * as React from "react";
import I18n from "../../../i18n";
import imageExpired from "../../../../img/wallet/errors/payment-expired-icon.png";
import hourglass from "../../../../img/pictograms/hourglass.png";
import {
  SignatureRequestDetailView,
  StatusEnum as SignatureRequestDetailStatus
} from "../../../../definitions/fci/SignatureRequestDetailView";
import { useIODispatch } from "../../../store/hooks";
import { fciEndRequest, fciStartRequest } from "../store/actions";
import ErrorComponent from "./ErrorComponent";
import GenericErrorComponent from "./GenericErrorComponent";

/**
 * A component to render the cases of success for a signature request
 */
const SuccessComponent = (props: {
  signatureRequest: SignatureRequestDetailView;
}) => {
  const now = new Date();
  const expires_at = new Date(props.signatureRequest.expires_at);
  const status = props.signatureRequest.status;
  const dispatch = useIODispatch();

  // if the user (signer) has not signed and the request is expired
  // the user can no longer sign anymore
  if (
    (status === SignatureRequestDetailStatus.WAIT_FOR_SIGNATURE ||
      status === SignatureRequestDetailStatus.REJECTED) &&
    expires_at < now
  ) {
    return (
      <ErrorComponent
        title={I18n.t("features.fci.errors.expired.title")}
        subTitle={I18n.t("features.fci.errors.expired.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        image={imageExpired}
        testID={"ExpiredSignatureRequestTestID"}
      />
    );
  }

  // the signature request could have various status
  switch (status) {
    case SignatureRequestDetailStatus.WAIT_FOR_SIGNATURE:
      dispatch(fciStartRequest());
      return null;
    case SignatureRequestDetailStatus.WAIT_FOR_QTSP:
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.waitForQtsp.title")}
          subTitle={I18n.t("features.fci.errors.waitForQtsp.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          image={hourglass}
          testID={"WaitQtspSignatureRequestTestID"}
        />
      );
    case SignatureRequestDetailStatus.SIGNED:
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.signed.title")}
          subTitle={I18n.t("features.fci.errors.signed.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          image={hourglass}
          testID={"WaitQtspSignatureRequestTestID"}
        />
      );
    default:
      return (
        <GenericErrorComponent onPress={() => dispatch(fciEndRequest())} />
      );
  }
};

export default SuccessComponent;
