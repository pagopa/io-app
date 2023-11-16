import React from "react";
import { SafeAreaView } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useNavigation } from "@react-navigation/native";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { itwRpPresentationSelector } from "../../../store/reducers/itwRpPresentationReducer";
import { itwRpInitializationEntityValueSelector } from "../../../store/reducers/itwRpInitializationReducer";
import { itwRpPresentation } from "../../../store/actions/itwRpActions";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { rpPidMock } from "../../../utils/mocks";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import ItwKoView from "../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../utils/errors/itwErrorsMapping";

const ItwPresentationScreen = () => {
  const dispatch = useIODispatch();
  const presentationResult = useIOSelector(itwRpPresentationSelector);
  const rpEntity = useIOSelector(itwRpInitializationEntityValueSelector);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  /**
   * Dispatches the action to start the RP presentation flow after the user confirms.
   */
  useOnFirstRender(() => {
    dispatch(itwRpPresentation.request());
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
          organizationName: rpPidMock.organizationName
        }
      )}
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  const ErrorView = () => {
    const onPress = () => navigation.goBack();
    const mappedError = getItwGenericMappedError(onPress);
    return <ItwKoView {...mappedError} />;
  };

  /**
   * Success screen component with a single button which completes the RP flow which shows the RP organization name.
   * @param rp - the RP entity configuration
   */
  const SuccessView = () => (
    <SafeAreaView style={{ ...IOStyles.flex }}>
      <ItwKoView
        pictogram="success"
        title={I18n.t(
          "features.itWallet.presentation.resultScreen.success.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.presentation.resultScreen.success.subtitle",
          {
            organizationName: rpPidMock.organizationName
          }
        )}
        action={{
          label: I18n.t("global.buttons.close"),
          accessibilityLabel: I18n.t("global.buttons.close"),
          onPress: () =>
            navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME })
        }}
      />
    </SafeAreaView>
  );

  /**
   * Render mask for the screen content.
   * Shows an error view if the RP entity is not present, otherwise folds the presentation status pot.
   */
  const RenderMask = () =>
    pipe(
      rpEntity,
      O.fold(
        () => <ErrorView />,
        (
          _ // some equals to the RP federation entity
        ) =>
          pot.fold(
            presentationResult,
            () => <LoadingView />,
            () => <LoadingView />,
            () => <LoadingView />,
            _ => <ErrorView />,
            _ => <SuccessView />,
            () => <LoadingView />,
            () => <LoadingView />,
            _ => <ErrorView />
          )
      )
    );

  return <RenderMask />;
};

export default ItwPresentationScreen;
