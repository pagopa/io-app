import I18n from "i18next";
import { useEffect, useMemo } from "react";

import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { SignatureRequestStatusEnum } from "../../../../definitions/fci/SignatureRequestStatus";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  trackFciSignatureExpired,
  trackFciSignatureRequestStatus
} from "../analytics";
import { fciEndRequest, fciStartRequest } from "../store/actions";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import SignatureStatusComponent from "./SignatureStatusComponent";

/**
 * A component to render the cases of success for a signature request
 */
const SuccessComponent = (props: {
  signatureRequest: SignatureRequestDetailView;
}) => {
  const issuer_email = props.signatureRequest.issuer.email;
  const status = props.signatureRequest.status;
  const fciDocuments = useIOSelector(fciSignatureDetailDocumentsSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const dispatch = useIODispatch();

  const now = new Date();
  const expires_at = useMemo(
    () => new Date(props.signatureRequest.expires_at),
    [props.signatureRequest.expires_at]
  );
  // if the user (signer) has not signed and the request is expired
  // the user can no longer sign anymore
  const isExpiredDocument =
    (status === SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE ||
      status === SignatureRequestStatusEnum.REJECTED) &&
    expires_at < now;

  useEffect(() => {
    const nowEffect = new Date();
    const expires_at_effect = new Date(props.signatureRequest.expires_at);

    const isExpiredDocumentEffect =
      (status === SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE ||
        status === SignatureRequestStatusEnum.REJECTED) &&
      expires_at_effect < nowEffect;

    if (isExpiredDocumentEffect) {
      trackFciSignatureExpired();
      return;
    }

    if (status === SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE) {
      trackFciSignatureRequestStatus({
        status,
        expiresAt: expires_at_effect,
        totalDocCount: fciDocuments.length,
        environment: fciEnvironment
      });
      dispatch(fciStartRequest());
    } else {
      trackFciSignatureRequestStatus({ status });
    }
  }, [
    dispatch,
    expires_at,
    fciDocuments.length,
    fciEnvironment,
    isExpiredDocument,
    props.signatureRequest.expires_at,
    status
  ]);

  // if the user (signer) has not signed and the request is expired
  // the user can no longer sign anymore
  if (isExpiredDocument) {
    return (
      <SignatureStatusComponent
        email={issuer_email}
        onPress={() => dispatch(fciEndRequest())}
        pictogram={"ended"}
        subTitle={I18n.t("features.fci.errors.expired.subTitle")}
        testID={"ExpiredSignatureRequestTestID"}
        title={I18n.t("features.fci.errors.expired.title")}
      />
    );
  }

  // the signature request could have various status
  switch (status) {
    case SignatureRequestStatusEnum.CANCELLED:
      return (
        <SignatureStatusComponent
          email={issuer_email}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"ended"}
          subTitle={I18n.t("features.fci.errors.generic.cancelled.subTitle")}
          testID={"CancelledSignatureRequestTestID"}
          title={I18n.t("features.fci.errors.generic.cancelled.title")}
        />
      );
    case SignatureRequestStatusEnum.REJECTED:
      return (
        <SignatureStatusComponent
          email={issuer_email}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"umbrella"}
          subTitle={I18n.t("features.fci.errors.generic.rejected.subTitle")}
          testID="RejectedSignatureRequestTestID"
          title={I18n.t("features.fci.errors.generic.rejected.title")}
        />
      );
    case SignatureRequestStatusEnum.SIGNED:
      return (
        <SignatureStatusComponent
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"success"}
          subTitle={I18n.t("features.fci.errors.signed.subTitle")}
          testID={"SignedSignatureRequestTestID"}
          title={I18n.t("features.fci.errors.signed.title")}
        />
      );
    case SignatureRequestStatusEnum.WAIT_FOR_QTSP:
      return (
        <SignatureStatusComponent
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"timing"}
          subTitle={I18n.t("features.fci.errors.waitForQtsp.subTitle")}
          testID={"WaitQtspSignatureRequestTestID"}
          title={I18n.t("features.fci.errors.waitForQtsp.title")}
        />
      );
    case SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE:
      return null;
    default:
      /* This case should not occur because all cases mapped
      by openapi are handled. If the status we receive
      from the BE is not mapped in the specifications,
      we receive an error handled by the error branch in
      the ts/features/fci/screens/FciRouterScreen.tsx file,
      so this default is never triggered. */
      return (
        <SignatureStatusComponent
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"umbrella"}
          subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
          title={I18n.t("features.fci.errors.generic.default.title")}
        />
      );
  }
};

export default SuccessComponent;
