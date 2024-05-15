import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { useEffect, useRef } from "react";
import { euCovidCertificateGet } from "../store/actions";
import {
  euCovidCertificateFromAuthCodeSelector,
  euCovidCertificateShouldBeLoadedSelector
} from "../store/reducers/byAuthCode";
import {
  EUCovidCertificate,
  EUCovidCertificateAuthCode
} from "../types/EUCovidCertificate";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { EUCovidContext } from "../components/EUCovidContext";
import { EUCovidCertParamsList } from "../navigation/params";
import { EUCovidCertificateResponse } from "../types/EUCovidCertificateResponse";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { EuCovidCertExpiredScreen } from "./EuCovidCertExpiredScreen";
import { EuCovidCertLoadingScreen } from "./EuCovidCertLoadingScreen";
import { EuCovidCertRevokedScreen } from "./EuCovidCertRevokedScreen";
import { EuCovidCertGenericErrorKoScreen } from "./ko/EuCovidCertGenericErrorKoScreen";
import { EuCovidCertNotFoundKoScreen } from "./ko/EuCovidCertNotFoundKoScreen";
import { EuCovidCertNotOperationalKoScreen } from "./ko/EuCovidCertNotOperationalKoScreen";
import { EuCovidCertTemporarilyNotAvailableKoScreen } from "./ko/EuCovidCertTemporarilyNotAvailableKoScreen";
import { EuCovidCertWrongFormatKoScreen } from "./ko/EuCovidCertWrongFormatKoScreen";
import { EuCovidCertValidScreen } from "./valid/EuCovidCertValidScreen";

export type EuCovidCertificateRouterScreenNavigationParams = Readonly<{
  authCode: EUCovidCertificateAuthCode;
  messageId: string;
}>;

/**
 * Return the right screen based on the response value
 * @param response
 */
const routeEuCovidResponse = (
  response: EUCovidCertificateResponse
): React.ReactElement => {
  switch (response.kind) {
    case "notFound":
      return <EuCovidCertNotFoundKoScreen />;
    case "notOperational":
      return <EuCovidCertNotOperationalKoScreen />;
    case "temporarilyNotAvailable":
      return <EuCovidCertTemporarilyNotAvailableKoScreen />;
    case "wrongFormat":
      return <EuCovidCertWrongFormatKoScreen />;
    case "success":
      return routeSuccessEuCovidResponse(response.value);
  }
};

const routeSuccessEuCovidResponse = (
  certificate: EUCovidCertificate
): React.ReactElement => {
  switch (certificate.kind) {
    case "valid":
      return (
        <EuCovidCertValidScreen
          validCertificate={certificate}
          headerData={certificate.headerData}
        />
      );
    case "revoked":
      return (
        <EuCovidCertRevokedScreen
          revokeInfo={certificate.markdownInfo}
          headerData={certificate.headerData}
        />
      );
    case "expired":
      return (
        <EuCovidCertExpiredScreen
          expiredInfo={certificate.markdownInfo}
          headerData={certificate.headerData}
        />
      );
  }
};

/**
 * Router screen that triggers the first loading of the certificate (if not present in the store)
 * and dispatch the rendering, based on the results of the certificate received
 * @constructor
 * @param props
 */
export const EuCovidCertificateRouterScreen = (
  props: IOStackNavigationRouteProps<
    EUCovidCertParamsList,
    "EUCOVIDCERT_CERTIFICATE"
  >
): React.ReactElement | null => {
  const authCode = props.route.params.authCode;
  const messageId = props.route.params.messageId;
  const shouldBeLoaded = useIOSelector(state =>
    euCovidCertificateShouldBeLoadedSelector(state, authCode)
  );
  const euCovidCertificateResponse = useIOSelector(state =>
    euCovidCertificateFromAuthCodeSelector(state, authCode)
  );
  const dispatch = useIODispatch();
  const firstLoading = useRef<boolean>(true);

  useEffect(() => {
    if (firstLoading.current) {
      // check if a load is required
      if (shouldBeLoaded) {
        dispatch(euCovidCertificateGet.request(authCode));
      }
      // eslint-disable-next-line functional/immutable-data
      firstLoading.current = false;
    }
  }, [dispatch, shouldBeLoaded, messageId, authCode]);

  // handle with the fold the remote state and with routeEuCovidResponse the different response values
  return (
    <EUCovidContext.Provider value={{ authCode, messageId }}>
      {pot.fold(
        euCovidCertificateResponse,
        () => (
          <EuCovidCertLoadingScreen />
        ),
        () => (
          <EuCovidCertLoadingScreen />
        ),
        _ => (
          <EuCovidCertLoadingScreen />
        ),
        _ => (
          <EuCovidCertGenericErrorKoScreen />
        ),
        response => routeEuCovidResponse(response),
        _ => (
          <EuCovidCertLoadingScreen />
        ),
        (_, __) => (
          <EuCovidCertLoadingScreen />
        ),
        _ => (
          <EuCovidCertGenericErrorKoScreen />
        )
      )}
    </EUCovidContext.Provider>
  );
};
