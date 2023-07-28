import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import ItwActionCompleted from "../../components/ItwActionCompleted";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import ROUTES from "../../../../navigation/routes";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { itwCredentialsAddPid } from "../../store/actions/credentials";
import { itwPidValueSelector } from "../../store/reducers/itwPid";
import { itwLifecycleIsValidSelector } from "../../store/reducers/itwLifecycle";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { Pictogram } from "../../../../components/core/pictograms";

/**
 * Renders an activation screen which displays a loading screen while the PID is being added and a success screen when the PID is added.
 */
const ItwPidActivationScreen = () => {
  // remove param from this screen
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwPidValueSelector);
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useOnFirstRender(() => {
    pipe(
      pid,
      O.fold(
        () => setIsError(true),
        some => dispatch(itwCredentialsAddPid(some))
      )
    );
  });

  useEffect(() => {
    if (isWalletValid) {
      setIsLoading(false);
    }
  }, [isWalletValid]);

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => navigation.navigate(ROUTES.ITWALLET_HOME),
    title: "Continua" // why plain string?
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

  const ErrorView = () => {
    const cancelButtonProps = {
      block: true,
      light: false,
      bordered: true,
      onPress: navigation.goBack,
      title: I18n.t("features.itWallet.generic.close")
    };
    return (
      <>
        <InfoScreenComponent
          title={I18n.t("features.itWallet.generic.error.title")}
          body={I18n.t("features.itWallet.generic.error.body")}
          image={<Pictogram name="error" />}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps}
        />
      </>
    );
  };

  return isLoading ? (
    <LoadingScreen />
  ) : isError ? (
    <ErrorView></ErrorView>
  ) : (
    <SuccessScreen />
  );
};

export default ItwPidActivationScreen;
