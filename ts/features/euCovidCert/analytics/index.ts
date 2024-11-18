import { getType } from "typesafe-actions";
import { mixpanel } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../utils/errors";
import { euCovidCertificateGet } from "../store/actions";
import {
  EUCovidCertificateResponse,
  isEuCovidCertificateSuccessResponse
} from "../types/EUCovidCertificateResponse";

const trackEuCovidCertificateActions =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): void => {
    switch (action.type) {
      case getType(euCovidCertificateGet.request):
        return mp.track(action.type);
      case getType(euCovidCertificateGet.success):
        return mp.track(
          action.type,
          trackEuCovidCertificateGetSuccessResponse(action.payload)
        );
      case getType(euCovidCertificateGet.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });
    }
  };

const trackEuCovidCertificateGetSuccessResponse = (
  response: EUCovidCertificateResponse
): Record<string, unknown> => {
  if (!isEuCovidCertificateSuccessResponse(response)) {
    return {
      containsInfo: false,
      containsDetails: false,
      qrCodeLength: undefined
    };
  }
  const containsInfo = response.value.markdownInfo !== undefined;
  const containsDetails =
    response.value.kind === "valid"
      ? response.value.markdownDetails !== undefined
      : false;
  const qrCodeLength =
    response.value.kind === "valid"
      ? response.value.qrCode.content.length
      : undefined;
  return {
    containsInfo,
    containsDetails,
    qrCodeLength
  };
};

export default trackEuCovidCertificateActions;
