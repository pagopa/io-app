import React from "react";
import { SafeAreaView } from "react-native";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { RpEntityConfiguration } from "@pagopa/io-react-native-wallet/lib/typescript/rp/types";
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
    onPress: () => dispatch(itwRpStop()),
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

  /**
   * Loading view component which shows a loading spinner and the RP organization name.
   * @param rp - the RP entity configuration
   */
  const LoadingView = ({ rp }: { rp: RpEntityConfiguration }) => (
    <ItwLoadingSpinner
      color={IOColors.blue}
      captionTitle={I18n.t(
        "features.itWallet.presentation.resultScreen.loading.title",
        {
          relayingParty: rp.payload.metadata.federation_entity.organization_name
        }
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
   * Success screen component with a single button which completes the RP flow which shows the RP organization name.
   * @param rp - the RP entity configuration
   */
  const SuccessView = ({ rp }: { rp: RpEntityConfiguration }) => (
    <>
      <ItwActionCompleted
        title={I18n.t(
          "features.itWallet.presentation.resultScreen.success.title"
        )}
        content={I18n.t(
          "features.itWallet.presentation.resultScreen.success.subTitle",
          {
            relayingParty:
              rp.payload.metadata.federation_entity.organization_name
          }
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
   * Render mask for the screen content.
   * Shows an error view if the RP entity is not present, otherwise folds the presentation status pot.
   */
  const RenderMask = () =>
    pipe(
      rpEntity,
      O.fold(
        () => (
          <ItwErrorView type="SingleButton" leftButton={cancelButtonProps} />
        ),
        someRp =>
          pot.fold(
            presentationResult,
            () => <LoadingView rp={someRp} />,
            () => <LoadingView rp={someRp} />,
            () => <LoadingView rp={someRp} />,
            err => <ErrorView error={err} />,
            _ => <SuccessView rp={someRp} />,
            () => <LoadingView rp={someRp} />,
            () => <LoadingView rp={someRp} />,
            (_, err) => <ErrorView error={err} />
          )
      )
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
