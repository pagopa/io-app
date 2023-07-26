import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCredentialsAddPid } from "../../store/actions";
import { PidMockType } from "../../utils/mocks";
import { itwAttestationsSelector } from "../../store/reducers/itwCredentials";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import ItwActionCompleted from "../../components/ItwActionCompleted";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import ROUTES from "../../../../navigation/routes";
import { ItwParamsList } from "../../navigation/params";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

/**
 * PidActivationScreen props which consists of the pid to be added to the wallet.
 */
export type ItwPidActivationScreenProps = {
  pid: PidMockType;
};

/**
 * PidActivationScreen props for type checking the screen.
 */
type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ACTIVATION_PID_ISSUING"
>;

/**
 * Renders an activation screen which displays a loading screen while the PID is being added and a success screen when the PID is added.
 * TODO: add an error screen when the PID is not added.
 * @param route - route params containg the PID.
 */
const ItwPidActivationScreen = ({ route }: Props) => {
  const dispatch = useIODispatch();
  const wallet = useIOSelector(itwAttestationsSelector);
  const navigation = useNavigation();
  useOnFirstRender(() => {
    dispatch(itwCredentialsAddPid.request());
  });

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => navigation.navigate(ROUTES.ITWALLET_HOME),
    title: "Continua"
  };

  const LoadingScreen = () => (
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

  const SuccessScreen = () => (
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

  const RenderMask = () =>
    pot.fold(
      wallet,
      () => <LoadingScreen />,
      () => <LoadingScreen />,
      () => <LoadingScreen />,
      _ => <LoadingScreen />, // TODO: handle error case
      _ => <SuccessScreen />,
      () => <LoadingScreen />,
      () => <LoadingScreen />,
      (_, __) => <LoadingScreen /> // TODO: handle error case
    );

  return <RenderMask />;
};

export default ItwPidActivationScreen;
