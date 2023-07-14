import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCredentialsAddPid } from "../../store/actions";
import { PidMockType } from "../../utils/mocks";
import { ItwWalletSelector } from "../../store/reducers/itwCredentials";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import ItwActionCompleted from "../../components/ItwActionCompleted";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import ROUTES from "../../../../navigation/routes";
import { ItwParamsList } from "../../navigation/params";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";

export type PidIssuingScreenProps = {
  vc: PidMockType;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ACTIVATION_PID_ISSUING"
>;

const PidIssuingScreen = ({ route }: Props) => {
  const dispatch = useIODispatch();
  const wallet = useIOSelector(ItwWalletSelector);
  const navigation = useNavigation();
  useOnFirstRender(() => {
    dispatch(itwCredentialsAddPid.request(route.params.vc));
  });

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => navigation.navigate(ROUTES.MAIN),
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

  return (
    <BaseScreenComponent
      headerTitle={I18n.t("features.itWallet.issuing.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <RenderMask />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default PidIssuingScreen;
