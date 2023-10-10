import React from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { IOStyles, useIOToast } from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import I18n from "../../../../i18n";
import { itwCredentialsChecks } from "../../store/actions/itwCredentialsActions";
import ItwErrorView from "../../components/ItwErrorView";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { CredentialCatalogItem } from "../../utils/mocks";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { ItwCredentialsChecksSelector } from "../../store/reducers/itwCredentialsChecksReducer";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ItwContinueScreen from "../../components/ItwResultComponent";
import ROUTES from "../../../../navigation/routes";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import { showCancelAlert } from "../../utils/alert";

/**
 * ItwAddCredentialsCheckScreen screen navigation params.
 * The credential consists of a mock in the form of a CredentialCatalogItem.
 */
export type ItwAddCredentialsCheckScreenNavigationParams = {
  credential: CredentialCatalogItem;
};

/**
 * Type of the route props for the ItwAddCredentialsCheckScreen.
 */
type ItwAddCredentialsRouteProp = RouteProp<
  ItwParamsList,
  "ITW_CREDENTIALS_ADD_CHECKS"
>;

/**
 * Renders a credentials check screen which displays a loading screen while checking the prerequisites for adding a credential.
 * Shows a success screen if the check is successful, an error screen otherwise.
 */
const ItwAddCredentialsCheckScreen = () => {
  const route = useRoute<ItwAddCredentialsRouteProp>();
  const navigation =
    useNavigation<IOStackNavigationProp<ItwParamsList & AppParamsList>>();
  const dispatch = useIODispatch();
  const credentialsCheckState = useIOSelector(ItwCredentialsChecksSelector);
  const toast = useIOToast();

  useOnFirstRender(() => {
    dispatch(itwCredentialsChecks.request(route.params.credential));
  });

  const alertOnPress = () => {
    toast.info(
      I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
    );
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
  };

  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle={I18n.t(
        "features.itWallet.issuing.credentialsChecksScreen.loading.title"
      )}
      isLoading
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  const SuccessView = () => (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ItwContinueScreen
          title={I18n.t(
            "features.itWallet.issuing.credentialsChecksScreen.success.title",
            { credentialName: route.params.credential.title }
          )}
          pictogram="identityAdd"
          action={{
            label: I18n.t("global.buttons.confirm"),
            accessibilityLabel: I18n.t("global.buttons.confirm"),
            onPress: () => navigation.navigate(ITW_ROUTES.CREDENTIALS.PREVIEW)
          }}
          secondaryAction={{
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: () => showCancelAlert(alertOnPress)
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );

  const ErrorView = ({ error }: { error: ItWalletError }) => (
    <ItwErrorView
      error={error}
      type="SingleButton"
      leftButton={cancelButtonProps(navigation.goBack)}
    />
  );

  const RenderMask = () =>
    pot.fold(
      credentialsCheckState,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      _ => <SuccessView />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, err) => <ErrorView error={err} />
    );

  return <RenderMask />;
};

export default ItwAddCredentialsCheckScreen;
