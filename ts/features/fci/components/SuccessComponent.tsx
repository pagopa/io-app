import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { fciEndRequest, fciStartRequest } from "../store/actions";
import { SignatureRequestStatusEnum } from "../../../../definitions/fci/SignatureRequestStatus";
import {
  trackFciDocAlreadySigned,
  trackFciDocOpening,
  trackFciDocSignatureInProgress,
  trackFciSignatureCancelled,
  trackFciSignatureExpired,
  trackFciSignatureRejected
} from "../analytics";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";
import SignatureStatusComponent from "./SignatureStatusComponent";

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
    trackFciSignatureExpired();
    return (
      <SignatureStatusComponent
        title={I18n.t("features.fci.errors.expired.title")}
        subTitle={I18n.t("features.fci.errors.expired.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        email={issuer_email}
        pictogram={"ended"}
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
      trackFciDocSignatureInProgress();
      return (
        <SignatureStatusComponent
          title={I18n.t("features.fci.errors.waitForQtsp.title")}
          subTitle={I18n.t("features.fci.errors.waitForQtsp.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"timing"}
          testID={"WaitQtspSignatureRequestTestID"}
        />
      );
    case SignatureRequestStatusEnum.SIGNED:
      trackFciDocAlreadySigned();
      return (
        <SignatureStatusComponent
          title={I18n.t("features.fci.errors.signed.title")}
          subTitle={I18n.t("features.fci.errors.signed.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"success"}
          testID={"SignedSignatureRequestTestID"}
        />
      );
    case SignatureRequestStatusEnum.REJECTED:
      trackFciSignatureRejected();
      return (
        <SignatureStatusComponent
          title={I18n.t("features.fci.errors.generic.rejected.title")}
          subTitle={I18n.t("features.fci.errors.generic.rejected.subTitle")}
          email={issuer_email}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"umbrella"}
          testID="RejectedSignatureRequestTestID"
        />
      );
    case SignatureRequestStatusEnum.CANCELLED:
      trackFciSignatureCancelled();
      return (
        <SignatureStatusComponent
          title={I18n.t("features.fci.errors.generic.cancelled.title")}
          subTitle={I18n.t("features.fci.errors.generic.cancelled.subTitle")}
          email={issuer_email}
          onPress={() => dispatch(fciEndRequest())}
          pictogram={"ended"}
          testID={"CancelledSignatureRequestTestID"}
        />
      );
    default:
      /* This case should not occur because all cases mapped
      by openapi are handled. If the status we receive
      from the BE is not mapped in the specifications,
      we receive an error handled by the error branch in
      the ts/features/fci/screens/FciRouterScreen.tsx file,
      so this default is never triggered. */
      return (
        <SignatureStatusComponent
          title={I18n.t("features.fci.errors.generic.default.title")}
          subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
          pictogram={"umbrella"}
          onPress={() => dispatch(fciEndRequest())}
        />
      );
  }
};

export default SuccessComponent;
