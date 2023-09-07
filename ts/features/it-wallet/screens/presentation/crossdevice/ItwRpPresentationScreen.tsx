import React from "react";
import { SafeAreaView, View } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { RouteProp, useRoute } from "@react-navigation/native";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import ItwErrorView from "../../../components/ItwErrorView";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import { itwRpPresentationSelector } from "../../../store/reducers/itwRpPresentationReducer";
import { itwRpInitializationEntityValueSelector } from "../../../store/reducers/itwRpInitializationReducer";
import ItwActionCompleted from "../../../components/ItwActionCompleted";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { itwRpPresentation } from "../../../store/actions/itwRpActions";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { navigateToItWalletHome } from "../../../utils/navigation";
import { FEDERATION_ENTITY } from "../../../utils/mocks";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";

/**
 * ItwRpResultScreenNavigationParams's navigation params.
 * The authReqUrl is the url to use to start the RP flow.
 */
export type ItwRpResultScreenNavigationParams = {
  authReqUrl: string;
  clientId: string;
};

/**
 * Type of the route props for the ItwPidRequestScreen.
 */
type ItwRpResultScreenRouteProps = RouteProp<
  ItwParamsList,
  "ITW_PRESETATION_CROSS_DEVICE_RESULT"
>;

const ItwPresentationScreen = () => {
  const route = useRoute<ItwRpResultScreenRouteProps>();
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
    onPress: () => dispatch(itwRpPresentation.request(route.params)),
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
    onPress: navigateToItWalletHome,
    title: I18n.t("global.buttons.cancel")
  };

  /**
   * Props for the complete button.
   * Dispatches the completion action to complete the RP flow.
   */
  const completeButtonProps = {
    onPress: navigateToItWalletHome,
    title: I18n.t(
      "features.itWallet.presentation.resultScreen.success.buttons.continue"
    )
  };

  /**
   * Dispatches the action to start the RP presentation flow after the user confirms.
   */
  useOnFirstRender(() => {
    dispatch(itwRpPresentation.request(route.params));
  });

  /**
   * Loading view component which shows a loading spinner and the RP organization name.
   */
  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      isLoading
      captionTitle={I18n.t(
        "features.itWallet.presentation.resultScreen.loading.title",
        {
          relayingParty: FEDERATION_ENTITY.organization_name
        }
      )}
      captionSubtitle={I18n.t(
        "features.itWallet.presentation.resultScreen.loading.subTitle"
      )}
    >
      <></>
    </ItwLoadingSpinnerOverlay>
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
  const SuccessView = () => (
    <>
      <ItwActionCompleted
        title={I18n.t(
          "features.itWallet.presentation.resultScreen.success.title"
        )}
        content={I18n.t(
          "features.itWallet.presentation.resultScreen.success.subTitle",
          {
            relayingParty: FEDERATION_ENTITY.organization_name
          }
        )}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={completeButtonProps}
      />
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
        (
          _ // some equals to the RP federation entity
        ) =>
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
          )
      )
    );

  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View></View>}
      headerTitle={I18n.t(
        "features.itWallet.presentation.pidAttributesScreen.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <RenderMask />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwPresentationScreen;
