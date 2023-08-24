import React from "react";
import { SafeAreaView } from "react-native";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import ItwErrorView from "../../../components/ItwErrorView";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  itwRpCompleted,
  itwRpStop,
  itwRpUserConfirmed
} from "../../../store/actions/itwRpActions";
import ItwLoadingSpinner from "../../../components/ItwLoadingSpinner";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import { itwRpPresentationSelector } from "../../../store/reducers/itwRpPresentationReducer";
import { itwRpInitializationEntityValueSelector } from "../../../store/reducers/itwRpInitializationReducer";
import ItwActionCompleted from "../../../components/ItwActionCompleted";
import { getRpEntityOrganizationName } from "../../../utils/rp";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";

const ItwRpResultScreen = () => {
  const dispatch = useIODispatch();
  const presentationResult = useIOSelector(itwRpPresentationSelector);
  const rpEntity = useIOSelector(itwRpInitializationEntityValueSelector);

  /**
   * Props for the retry button.
   * Dispatches again the action to continue the presentation flow.
   */
  const retryButtonProps = {
    block: true,
    primary: true,
    onPress: () => dispatch(itwRpUserConfirmed()),
    title: I18n.t("global.buttons.retry")
  };

  /**
   * Props for the cancel button.
   * Dispatches again the action to stop the RP flow.
   */
  const cancelButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: () => dispatch(itwRpStop()),
    title: I18n.t(
      "features.itWallet.presentation.resultScreen.error.buttons.cancel"
    )
  };

  /**
   * Props for the complete button.
   * Dispatches the completion action to complete the RP flow.
   */
  const completeButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: () => dispatch(itwRpCompleted()),
    title: I18n.t(
      "features.itWallet.presentation.resultScreen.success.buttons.continue"
    )
  };

  /**
   * Dispatches the action to start the RP presentation flow after the user confirms.
   */
  useOnFirstRender(() => {
    dispatch(itwRpUserConfirmed());
  });

  /*
   * Loading view component.
   */
  const LoadingView = () => (
    <ItwLoadingSpinner
      color={IOColors.blue}
      captionTitle={I18n.t(
        "features.itWallet.presentation.resultScreen.loading.title",
        { relayingParty: getRpEntityOrganizationName(rpEntity) }
      )}
      captionSubtitle={I18n.t(
        "features.itWallet.presentation.resultScreen.loading.subTitle"
      )}
    />
  );

  /**
   * Error view with a single button which stops the RP flow.
   * @param error - the ItWalletError to display.
   */
  const ErrorView = ({ error }: { error: ItWalletError }) => (
    <ItwErrorView
      type="TwoButtonsInlineThird"
      leftButton={retryButtonProps}
      rightButton={cancelButtonProps}
      error={error}
      pictogramName="umbrella"
    />
  );

  /**
   * Success screen component with a single button which completes the RP flow.
   */
  const SuccessView = () => (
    <>
      <ItwActionCompleted
        title={I18n.t(
          "features.itWallet.presentation.resultScreen.success.title"
        )}
        content={I18n.t(
          "features.itWallet.presentation.resultScreen.success.subTitle",
          { relayingParty: getRpEntityOrganizationName(rpEntity) }
        )}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={completeButtonProps}
      />
      <VSpacer size={24} />
    </>
  );

  /**
   * Render mask which folds the presentation status of the RP flow.
   */
  const RenderMask = () =>
    pot.fold(
      presentationResult,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      _ => <SuccessView />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, err) => <ErrorView error={err} />
    );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.itWallet.presentation.initializationScreen.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <RenderMask />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwRpResultScreen;
