import * as React from "react";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import I18n from "../../../i18n";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { fciEndRequest, fciStartRequest } from "../store/actions";
import { SignatureRequestStatusEnum } from "../../../../definitions/fci/SignatureRequestStatus";
import { trackFciDocOpening } from "../analytics";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";
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
  const issuer_email = props.signatureRequest.issuer.email;
  const status = props.signatureRequest.status;
  const fciDocuments = useIOSelector(fciSignatureDetailDocumentsSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const dispatch = useIODispatch();

  // if the user (signer) has not signed and the request is expired
  // the user can no longer sign anymore
  if (
    (status === SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE ||
      status === SignatureRequestStatusEnum.REJECTED) &&
    expires_at < now
  ) {
    return (
      <ErrorComponent
        title={I18n.t("features.fci.errors.expired.title")}
        subTitle={I18n.t("features.fci.errors.expired.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        email={issuer_email}
        pictogram={"timeout"}
        testID={"ExpiredSignatureRequestTestID"}
      />
    );
  }

  // the signature request could have various status
  switch (status) {
    case SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE:
      trackFciDocOpening(expires_at, fciDocuments.length, fciEnvironment);
      dispatch(fciStartRequest());
      return null;
    case SignatureRequestStatusEnum.WAIT_FOR_QTSP:
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.waitForQtsp.title")}
          subTitle={I18n.t("features.fci.errors.waitForQtsp.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"hourglass"}
          testID={"WaitQtspSignatureRequestTestID"}
        />
      );
    case SignatureRequestStatusEnum.SIGNED:
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.signed.title")}
          subTitle={I18n.t("features.fci.errors.signed.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"fireworks"}
          testID={"SignedSignatureRequestTestID"}
        />
      );
    case SignatureRequestStatusEnum.REJECTED:
      return (
        <GenericErrorComponent
          title={I18n.t("features.fci.errors.generic.rejected.title")}
          subTitle={I18n.t("features.fci.errors.generic.rejected.subTitle")}
          email={issuer_email}
          onPress={() => dispatch(fciEndRequest())}
          testID="RejectedSignatureRequestTestID"
        />
      );
    case SignatureRequestStatusEnum.CANCELLED:
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.generic.cancelled.title")}
          subTitle={I18n.t("features.fci.errors.generic.cancelled.subTitle")}
          email={issuer_email}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"timeout"}
          testID={"CancelledSignatureRequestTestID"}
        />
      );
    default:
      return (
        <GenericErrorComponent
          title={I18n.t("features.fci.errors.generic.default.title")}
          subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
        />
      );
  }
};

export default SuccessComponent;
