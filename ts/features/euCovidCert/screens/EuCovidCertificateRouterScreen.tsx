import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useEffect, useRef } from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setMessageReadState } from "../../../store/actions/messages";
import { GlobalState } from "../../../store/reducers/types";
import { euCovidCertificateGet } from "../store/actions";
import {
  euCovidCertificateFromAuthCodeSelector,
  euCovidCertificateShouldBeLoadedSelector
} from "../store/reducers/byAuthCode";
import {
  EUCovidCertificateAuthCode,
  EUCovidCertificate
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

type NavigationParams = Readonly<{
  authCode: EUCovidCertificateAuthCode;
  messageId: string;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

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
      return <EuCovidCertValidScreen validCertificate={certificate} />;
    case "revoked":
      return <EuCovidCertRevokedScreen revokeInfo={certificate.markdownInfo} />;
    case "expired":
      return (
        <EuCovidCertExpiredScreen expiredInfo={certificate.markdownInfo} />
      );
  }
};

/**
 * Router screen that triggers the first loading of the certificate (if not present in the store)
 * and dispatch the rendering, based on the results of the certificate received
 * @constructor
 * @param props
 */
const EuCovidCertificateRouterScreen = (
  props: Props
): React.ReactElement | null => {
  const authCode = props.navigation.getParam("authCode");
  const messageId = props.navigation.getParam("messageId");
  const { setMessageRead, shouldBeLoaded, loadCertificate } = props;
  const firstLoading = useRef<boolean>(true);

  useEffect(() => {
    if (firstLoading.current) {
      // At the first rendering, set the message to read
      setMessageRead(messageId);
      // check if a load is required
      if (shouldBeLoaded(authCode)) {
        loadCertificate(authCode);
      }
      // eslint-disable-next-line functional/immutable-data
      firstLoading.current = false;
    }
  }, [setMessageRead, shouldBeLoaded, loadCertificate, messageId, authCode]);

  // handle with the fold the remote state and with routeEuCovidResponse the different response values
  return pot.fold(
    props.euCovidCertificateResponse(authCode),
    () => <EuCovidCertLoadingScreen />,
    () => <EuCovidCertLoadingScreen />,
    _ => <EuCovidCertLoadingScreen />,
    _ => <EuCovidCertGenericErrorKoScreen />,
    response => routeEuCovidResponse(response),
    _ => <EuCovidCertLoadingScreen />,
    (_, __) => <EuCovidCertLoadingScreen />,
    _ => <EuCovidCertGenericErrorKoScreen />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadCertificate: (authCode: EUCovidCertificateAuthCode) =>
    dispatch(euCovidCertificateGet.request(authCode)),
  setMessageRead: (messageId: string) =>
    dispatch(setMessageReadState(messageId, true))
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
