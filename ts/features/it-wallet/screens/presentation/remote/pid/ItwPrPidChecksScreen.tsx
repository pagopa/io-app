import React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "@pagopa/io-app-design-system";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import {
  RpData,
  itwRpInitializationSelector
} from "../../../../store/reducers/itwRpInitializationReducer";
import ItwLoadingSpinnerOverlay from "../../../../components/ItwLoadingSpinnerOverlay";
import { itwRpInitialization } from "../../../../store/actions/itwRpActions";
import { rpPidMock } from "../../../../utils/mocks";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import ItwKoView from "../../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../../utils/itwErrorsUtils";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import ItwContinueView from "../../../../components/ItwContinueView";

/**
 * ItwPrPidChecksScreenNavigationParams's navigation params.
 * The authReqUrl is the url to use to start the RP flow.
 */
export type ItwPrPidChecksScreenNavigationParams = RpData;

/**
 * Type of the route props for the ItwPidRequestScreen.
 */
type ItwPrPidChecksScreenRouteProps = RouteProp<
  ItwParamsList,
  "ITW_PRESENTATION_PID_REMOTE_CHECKS"
>;

const ItwPrPidChecksScreen = () => {
  const route = useRoute<ItwPrPidChecksScreenRouteProps>();
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const initStatus = useIOSelector(itwRpInitializationSelector);

  /**
   * Dispatches the action to start the RP flow on first render.
   */
  useOnFirstRender(() => {
    dispatch(
      itwRpInitialization.request({
        authReqUrl: route.params.authReqUrl,
        clientId: route.params.clientId
      })
    );
  });

  const SuccessView = () => (
    <SafeAreaView style={IOStyles.flex}>
      <ItwContinueView
        title={I18n.t("features.itWallet.presentation.checksScreen.success", {
          organizationName: rpPidMock.organizationName
        })}
        pictogram="security"
        action={{
          label: I18n.t("global.buttons.confirm"),
          accessibilityLabel: I18n.t("global.buttons.confirm"),
          onPress: () =>
            navigation.navigate(ITW_ROUTES.PRESENTATION.PID.REMOTE.DATA)
        }}
      />
    </SafeAreaView>
  );

  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle={I18n.t(
        "features.itWallet.presentation.checksScreen.loading"
      )}
      isLoading
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
   * Render mask which folds the initialization status of the RP flow.
   */
  const RenderMask = () =>
    pot.fold(
      initStatus,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      _ => <ErrorView />,
      _ => <SuccessView />,
      () => <LoadingView />,
      () => <LoadingView />,
      _ => <ErrorView />
    );

  return <RenderMask />;
};

export default ItwPrPidChecksScreen;
