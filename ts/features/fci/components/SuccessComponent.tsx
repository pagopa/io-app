import * as React from "react";
import I18n from "../../../i18n";
import imageExpired from "../../../../img/wallet/errors/payment-expired-icon.png";
import hourglass from "../../../../img/pictograms/hourglass.png";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { useIODispatch } from "../../../store/hooks";
import { fciStartRequest } from "../store/actions";
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

  // the signature request is expired
  if (expires_at < now) {
    return (
      <ErrorComponent
        title={I18n.t("features.fci.errors.expired.title")}
        subTitle={I18n.t("features.fci.errors.expired.subTitle")}
        image={imageExpired}
        testID={"ExpiredSignatureRequestTestID"}
      />
    );
  }

  // TODO: add a check for the unsupported device (lollipop)

  // the signature request could have various status
  switch (status) {
    case "WAIT_FOR_SIGNATURE":
      dispatch(fciStartRequest());
      return null;
    case "WAIT_FOR_QTSP":
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.waitForQtsp.title")}
          subTitle={I18n.t("features.fci.errors.waitForQtsp.subTitle")}
          image={hourglass}
          testID={"WaitQtspSignatureRequestTestID"}
        />
      );
    case "SIGNED":
      // TODO: make the path to the signed document dynamic
      return null;
    default:
      return <GenericErrorComponent />;
  }
};

export default SuccessComponent;
