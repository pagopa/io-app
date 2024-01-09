import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import { itwPrRemoteCredentialInit } from "../../../../store/actions/itwPrRemoteCredentialActions";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import ItwLoadingSpinnerOverlay from "../../../../components/ItwLoadingSpinnerOverlay";
import ItwContinueScreen from "../../../../components/ItwContinueView";
import I18n from "../../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { getRpMock } from "../../../../utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import ItwKoView from "../../../../components/ItwKoView";
import { itwActivationStart } from "../../../../store/actions/itwActivationActions";
import {
  ItWalletError,
  ItWalletErrorTypes,
  ItwErrorMapping,
  getItwGenericMappedError
} from "../../../../utils/itwErrorsUtils";
import { itwPrRemoteCredentialInitSelector } from "../../../../store/reducers/itwPrRemoteCredentialReducer";

/**
 * This screen is used to perform different checks before initiating the presentation flow.
 * It shows a loading spinner while the checks are being performed and then it shows a success screen with the name of the relaying party if the checks are successful.
 * It shows an error screen if the checks fail.
 * The view is rendered based on the state of the checks pot.
 */
const ItwPrRemoteCredentialInitScreen = () => {
  const dispatch = useIODispatch();
  const initPot = useIOSelector(itwPrRemoteCredentialInitSelector);
  const navigation =
    useNavigation<IOStackNavigationProp<ItwParamsList & AppParamsList>>();
  const rpMock = getRpMock();

  useOnFirstRender(() => {
    dispatch(itwPrRemoteCredentialInit.request());
  });

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

  const SuccessView = () => (
    <SafeAreaView style={IOStyles.flex}>
      <ItwContinueScreen
        title={I18n.t("features.itWallet.presentation.checksScreen.success", {
          organizationName: rpMock.organizationName
        })}
        pictogram="security"
        action={{
          label: I18n.t("global.buttons.confirm"),
          accessibilityLabel: I18n.t("global.buttons.confirm"),
          onPress: () =>
            navigation.navigate(ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.DATA)
        }}
      />
    </SafeAreaView>
  );

  const RenderMask = () =>
    pot.fold(
      initPot,
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

export default ItwPrRemoteCredentialInitScreen;
