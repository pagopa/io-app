import { getType } from "typesafe-actions";
import { mixpanel } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../utils/errors";
import { euCovidCertificateGet } from "../store/actions";
import {
  EUCovidCertificateResponse,
  isEuCovidCertificateSuccessResponse
} from "../types/EUCovidCertificateResponse";

export const trackEuCovidCertificateActions = (
  mp: NonNullable<typeof mixpanel>
) => (action: Action): Promise<void> => {
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
  return Promise.resolve();
};

const trackEuCovidCertificateGetSuccessResponse = (
  response: EUCovidCertificateResponse
): Record<string, unknown> | undefined => {
  const containsInfo = isEuCovidCertificateSuccessResponse(response)
    ? response.value.markdownInfo !== undefined
    : false;
  const containsDetails =
    isEuCovidCertificateSuccessResponse(response) &&
    response.value.kind === "valid"
      ? response.value.markdownDetails !== undefined
      : false;

  const qrCodeLength =
    isEuCovidCertificateSuccessResponse(response) &&
    response.value.kind === "valid"
      ? response.value.qrCode.content.length
      : undefined;

  const responseType =
    response.kind === "success" ? response.value.kind : response.kind;

  return {
    containsInfo,
    containsDetails,
    qrCodeLength,
    responseType
  };
};
