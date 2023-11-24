import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { VSpacer } from "@pagopa/io-app-design-system";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";
import I18n from "../../../../../i18n";
import { itwPidValueSelector } from "../../../store/reducers/itwPidReducer";
import { itwCredentialsAddPid } from "../../../store/actions/itwCredentialsActions";
import { itwActivationCompleted } from "../../../store/actions/itwActivationActions";
import { ItwCredentialsStateSelector } from "../../../store/reducers/itwCredentialsReducer";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import ItwContinueView from "../../../components/ItwContinueView";
import ItwKoView from "../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../utils/errors/itwErrorsMapping";

/**
 * Renders an activation screen which displays a loading screen while the PID is being added and a success screen when the PID is added.
 */
const ItwPidAddingScreen = () => {
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwPidValueSelector);
  const navigation = useNavigation();
  const credentialsState = useIOSelector(ItwCredentialsStateSelector);

  useOnFirstRender(() => {
    dispatch(itwCredentialsAddPid.request(pid));
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

export default ItwPidAddingScreen;
