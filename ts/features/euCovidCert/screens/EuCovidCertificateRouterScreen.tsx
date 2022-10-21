import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as React from "react";
import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../store/reducers/types";
import { EUCovidCertParamsList } from "../navigation/params";
import { euCovidCertificateGet } from "../store/actions";
import {
  euCovidCertificateFromAuthCodeSelector,
  euCovidCertificateShouldBeLoadedSelector
} from "../store/reducers/byAuthCode";
import {
  EUCovidCertificate,
  EUCovidCertificateAuthCode
} from "../types/EUCovidCertificate";
import { EUCovidCertificateResponse } from "../types/EUCovidCertificateResponse";
import EuCovidCertExpiredScreen from "./EuCovidCertExpiredScreen";
import EuCovidCertLoadingScreen from "./EuCovidCertLoadingScreen";
import EuCovidCertRevokedScreen from "./EuCovidCertRevokedScreen";
import EuCovidCertGenericErrorKoScreen from "./ko/EuCovidCertGenericErrorKoScreen";
import EuCovidCertNotFoundKoScreen from "./ko/EuCovidCertNotFoundKoScreen";
import EuCovidCertNotOperationalKoScreen from "./ko/EuCovidCertNotOperationalKoScreen";
import EuCovidCertTemporarilyNotAvailableKoScreen from "./ko/EuCovidCertTemporarilyNotAvailableKoScreen";
import EuCovidCertWrongFormatKoScreen from "./ko/EuCovidCertWrongFormatKoScreen";
import EuCovidCertValidScreen from "./valid/EuCovidCertValidScreen";

export type EuCovidCertificateRouterScreenNavigationParams = Readonly<{
  authCode: EUCovidCertificateAuthCode;
  messageId: string;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

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

export const EUCovidContext =
  React.createContext<EuCovidCertificateRouterScreenNavigationParams | null>(
    null
  );

/**
 * Router screen that triggers the first loading of the certificate (if not present in the store)
 * and dispatch the rendering, based on the results of the certificate received
 * @constructor
 * @param props
 */
const EuCovidCertificateRouterScreen = (
  props: Props
): React.ReactElement | null => {
  const route =
    useRoute<RouteProp<EUCovidCertParamsList, "EUCOVIDCERT_CERTIFICATE">>();

  const authCode = route.params.authCode;
  const messageId = route.params.messageId;
  const { shouldBeLoaded, loadCertificate } = props;
  const firstLoading = useRef<boolean>(true);

  useEffect(() => {
    if (firstLoading.current) {
      // check if a load is required
      if (shouldBeLoaded(authCode)) {
        loadCertificate(authCode);
      }
      // eslint-disable-next-line functional/immutable-data
      firstLoading.current = false;
    }
  }, [shouldBeLoaded, loadCertificate, messageId, authCode]);

  // handle with the fold the remote state and with routeEuCovidResponse the different response values
  return (
    <EUCovidContext.Provider value={{ authCode, messageId }}>
      {pot.fold(
        props.euCovidCertificateResponse(authCode),
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadCertificate: (authCode: EUCovidCertificateAuthCode) =>
    dispatch(euCovidCertificateGet.request(authCode))
});

const mapStateToProps = (state: GlobalState) => ({
  shouldBeLoaded: (authCode: EUCovidCertificateAuthCode) =>
    euCovidCertificateShouldBeLoadedSelector(state, authCode),
  euCovidCertificateResponse: (authCode: EUCovidCertificateAuthCode) =>
    euCovidCertificateFromAuthCodeSelector(state, authCode)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertificateRouterScreen);
