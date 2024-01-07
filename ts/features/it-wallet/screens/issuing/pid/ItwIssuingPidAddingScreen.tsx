import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { VSpacer } from "@pagopa/io-app-design-system";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";
import I18n from "../../../../../i18n";
import { itwIssuancePidValueSelector } from "../../../store/reducers/issuance/pid/itwIssuancePidReducer";
import { itwPersistedCredentialsAddPid } from "../../../store/actions/itwPersistedCredentialsActions";
import { itwActivationCompleted } from "../../../store/actions/itwActivationActions";
import { itwPersistedCredentialsSelector } from "../../../store/reducers/itwPersistedCredentialsReducer";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../../utils/itwErrorsUtils";
import ItwContinueView from "../../../components/ItwContinueView";
import ItwKoView from "../../../components/ItwKoView";

/**
 * Renders an activation screen which displays a loading screen while the PID is being added and a success screen when the PID is added.
 */
const ItwIssuingPidAddingScreen = () => {
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwIssuancePidValueSelector);
  const navigation = useNavigation();
  const credentialsState = useIOSelector(itwPersistedCredentialsSelector);

  useOnFirstRender(() => {
    dispatch(itwPersistedCredentialsAddPid.request(pid));
  });

  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle={I18n.t(
        "features.itWallet.issuing.pidActivationScreen.loading.title"
      )}
      isLoading
      captionSubtitle={I18n.t(
        "features.itWallet.issuing.pidActivationScreen.loading.subtitle"
      )}
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  const SuccessView = () => (
    <>
      <ItwContinueView
        title={I18n.t(
          "features.itWallet.issuing.pidActivationScreen.typ.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.issuing.pidActivationScreen.typ.content"
        )}
        pictogram="success"
        action={{
          label: I18n.t(
            "features.itWallet.issuing.pidActivationScreen.typ.button"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.issuing.pidActivationScreen.typ.button"
          ),
          onPress: () => dispatch(itwActivationCompleted())
        }}
      />
      <VSpacer size={24} />
    </>
  );

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  const RenderMask = () =>
    pot.fold(
      credentialsState,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      _ => <SuccessView />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, err) => <ErrorView error={err} />
    );

  return <RenderMask />;
};

export default ItwIssuingPidAddingScreen;
