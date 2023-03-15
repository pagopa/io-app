import * as React from "react";
import { createSelector } from "reselect";
import * as O from "fp-ts/lib/Option";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import I18n from "../../../i18n";
import imageExpired from "../../../../img/wallet/errors/payment-expired-icon.png";
import hourglass from "../../../../img/pictograms/hourglass.png";
import {
  SignatureRequestDetailView,
  StatusEnum as SignatureRequestDetailStatus
} from "../../../../definitions/fci/SignatureRequestDetailView";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import {
  fciEndRequest,
  fciShowSignedDocumentsStartRequest,
  fciStartRequest
} from "../store/actions";
import { daysBetweenDate } from "../utils/dates";
import { lollipopPublicKeySelector } from "../../lollipop/store/reducers/lollipop";
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
  const updated_at = new Date(props.signatureRequest.updated_at);
  const issuer_email = props.signatureRequest.issuer.email;
  const status = props.signatureRequest.status;
  const dispatch = useIODispatch();

  const publicKeyOption = useIOSelector(
    createSelector(lollipopPublicKeySelector, V => V)
  );
  const isLollipopEnabled = useIOSelector(isLollipopEnabledSelector);
  const showUnsupportedDeviceBanner =
    isLollipopEnabled && O.isNone(publicKeyOption);

  // If the device is not supported by Lollipop
  // This is a temporary solution during the development of Lollipop
  // and its integration with FCI
  if (showUnsupportedDeviceBanner) {
    return (
      <GenericErrorComponent
        title={I18n.t("features.fci.errors.generic.update.title")}
        subTitle={I18n.t("features.fci.errors.generic.update.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
      />
    );
  }

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

  // if 90 days have passed since the request has been signed
  // the user (signer) could not download the signed documents
  if (
    status === SignatureRequestDetailStatus.SIGNED &&
    daysBetweenDate(updated_at, now) > 90
  ) {
    return (
      <ErrorComponent
        title={I18n.t("features.fci.errors.expiredAfterSigned.title")}
        subTitle={I18n.t("features.fci.errors.expiredAfterSigned.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        image={imageExpired}
        testID={"ExpiredSignedSignatureRequestTestID"}
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
      dispatch(fciShowSignedDocumentsStartRequest());
      return null;
    case SignatureRequestDetailStatus.REJECTED:
      return (
        <GenericErrorComponent
          title={I18n.t("features.fci.errors.generic.rejected.title")}
          subTitle={I18n.t("features.fci.errors.generic.rejected.subTitle")}
          email={issuer_email}
          onPress={() => dispatch(fciEndRequest())}
          testID="RejectedSignatureRequestTestID"
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
