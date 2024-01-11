import React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "@pagopa/io-app-design-system";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "../../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import ItwLoadingSpinnerOverlay from "../../../../components/ItwLoadingSpinnerOverlay";
import {
  ItwPrRemotePidInitData,
  itwPrRemotePidInit
} from "../../../../store/actions/itwPrRemotePidActions";
import { rpPidMock } from "../../../../utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import ItwKoView from "../../../../components/ItwKoView";
import {
  ItWalletError,
  ItWalletErrorTypes,
  ItwErrorMapping,
  getItwGenericMappedError
} from "../../../../utils/itwErrorsUtils";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import ItwContinueView from "../../../../components/ItwContinueView";
import { itwActivationStart } from "../../../../store/actions/itwActivationActions";
import { itwPrRemotePidInitSelector } from "../../../../store/reducers/itwPrRemotePidReducer";

/**
 * ItwPrRemotePidChecksScreenNavigationParams's navigation params.
 * The authReqUrl is the url to use to start the RP flow.
 */
export type ItwPrRemotePidChecksScreenNavigationParams = ItwPrRemotePidInitData;

/**
 * Type of the route props for the ItwIssuancePidRequestScreen.
 */
type ItwPrRemotePidChecksScreenRouteProps = RouteProp<
  ItwParamsList,
  "ITW_PRESENTATION_PID_REMOTE_INIT"
>;

const ItwPrRemotePidChecksScreen = () => {
  const route = useRoute<ItwPrRemotePidChecksScreenRouteProps>();
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const initStatus = useIOSelector(itwPrRemotePidInitSelector);

  /**
   * Dispatches the action to start the RP flow on first render.
   */
  useOnFirstRender(() => {
    dispatch(
      itwPrRemotePidInit.request({
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

  /**
   * Error mapping function for any error that can be displayed in this screen.
   * @param error - optional ItWalletError to be displayed.
   * @returns a mapped error object or a generic error object when error is not provided.
   */
  const getScreenError: ItwErrorMapping = (error?: ItWalletError) => {
    switch (error?.code) {
      case ItWalletErrorTypes.WALLET_NOT_VALID_ERROR:
        return {
          title: I18n.t(
            "features.itWallet.presentation.checksScreen.errors.walletNotValid.title"
          ),
          subtitle: I18n.t(
            "features.itWallet.presentation.checksScreen.errors.walletNotValid.subtitle"
          ),
          pictogram: "umbrella",
          action: {
            accessibilityLabel: I18n.t(
              "features.itWallet.presentation.checksScreen.errors.walletNotValid.actionLabel"
            ),
            label: I18n.t(
              "features.itWallet.presentation.checksScreen.errors.walletNotValid.actionLabel"
            ),
            onPress: () => dispatch(itwActivationStart())
          },
          secondaryAction: {
            accessibilityLabel: I18n.t("global.buttons.close"),
            label: I18n.t("global.buttons.close"),
            onPress: () => navigation.goBack()
          }
        };
      default:
        return getItwGenericMappedError(() => navigation.goBack());
    }
  };

  const ErrorView = ({ error }: { error: ItWalletError }) => {
    const mappedError = getScreenError(error);
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
      error => <ErrorView error={error} />,
      _ => <SuccessView />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, error) => <ErrorView error={error} />
    );

  return <RenderMask />;
};

export default ItwPrRemotePidChecksScreen;
