import * as React from "react";
import { shallowEqual } from "react-redux";
import * as O from "fp-ts/lib/Option";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import I18n from "../../../i18n";
import imageExpired from "../../../../img/wallet/errors/payment-expired-icon.png";
import hourglass from "../../../../img/pictograms/hourglass.png";
import fireworks from "../../../../img/pictograms/fireworks.png";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import { fciEndRequest, fciStartRequest } from "../store/actions";
import { lollipopPublicKeySelector } from "../../lollipop/store/reducers/lollipop";
import { SignatureRequestStatusEnum } from "../../../../definitions/fci/SignatureRequestStatus";
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
  const dispatch = useIODispatch();

  const publicKeyOption = useIOSelector(
    lollipopPublicKeySelector,
    shallowEqual
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
        image={imageExpired}
        testID={"ExpiredSignatureRequestTestID"}
      />
    );
  }

  // the signature request could have various status
  switch (status) {
    case SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE:
      dispatch(fciStartRequest());
      return null;
    case SignatureRequestStatusEnum.WAIT_FOR_QTSP:
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.waitForQtsp.title")}
          subTitle={I18n.t("features.fci.errors.waitForQtsp.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          image={hourglass}
          testID={"WaitQtspSignatureRequestTestID"}
        />
      );
    case SignatureRequestStatusEnum.SIGNED:
      return (
        <ErrorComponent
          title={I18n.t("features.fci.errors.signed.title")}
          subTitle={I18n.t("features.fci.errors.signed.subTitle")}
          onPress={() => dispatch(fciEndRequest())}
          image={fireworks}
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
