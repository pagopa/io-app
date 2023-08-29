import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import ItwActionCompleted from "../../components/ItwActionCompleted";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { itwPidValueSelector } from "../../store/reducers/itwPidReducer";
import { itwCredentialsAddPid } from "../../store/actions/itwCredentialsActions";
import { itwActivationCompleted } from "../../store/actions/itwActivationActions";
import ItwErrorView from "../../components/ItwErrorView";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import { ItwCredentialsStateSelector } from "../../store/reducers/itwCredentialsReducer";
import { ItWalletError } from "../../utils/errors/itwErrors";

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

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => {
      dispatch(itwActivationCompleted());
    },
    title: I18n.t("global.buttons.continue")
  };

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
      <ItwActionCompleted
        title={I18n.t(
          "features.itWallet.issuing.pidActivationScreen.typ.title"
        )}
        content={I18n.t(
          "features.itWallet.issuing.pidActivationScreen.typ.content"
        )}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={continueButtonProps}
      />
      <VSpacer size={24} />
    </>
  );

  const ErrorView = ({ error }: { error: ItWalletError }) => (
    <ItwErrorView
      error={error}
      type="SingleButton"
      leftButton={cancelButtonProps(navigation.goBack)}
    />
  );

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
