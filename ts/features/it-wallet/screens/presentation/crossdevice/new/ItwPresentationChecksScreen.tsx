import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import { itwPresentationChecks } from "../../../../store/actions/new/itwPresentationActions";
import { itwPresentationChecksSelector } from "../../../../store/reducers/new/itwPresentationReducer";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import ItwLoadingSpinnerOverlay from "../../../../components/ItwLoadingSpinnerOverlay";
import ItwErrorView from "../../../../components/ItwErrorView";
import { cancelButtonProps } from "../../../../utils/itwButtonsUtils";
import { ItWalletError } from "../../../../utils/errors/itwErrors";
import ItwContinueScreen from "../../../../components/ItwResultComponent";
import I18n from "../../../../../../i18n";
import { showCancelAlert } from "../../../../utils/alert";
import ROUTES from "../../../../../../navigation/routes";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { rpMock } from "../../../../utils/mocks";

/**
 * This screen is used to perform different checks before initiating the presentation flow.
 * It shows a loading spinner while the checks are being performed and then it shows a success screen with the name of the relaying party if the checks are successful.
 * It shows an error screen if the checks fail.
 * The view is rendered based on the state of the checks pot.
 */
const ItwPresentationChecksScreen = () => {
  const dispatch = useIODispatch();
  const checksPot = useIOSelector(itwPresentationChecksSelector);
  const navigation =
    useNavigation<IOStackNavigationProp<ItwParamsList & AppParamsList>>();

  /**
   * Callback to be used in case of cancel button press alert to navigate to the home screen and show a toast.
   */
  const alertOnPress = () => {
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
  };

  useOnFirstRender(() => {
    dispatch(itwPresentationChecks.request());
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

  const ErrorView = ({ error }: { error: ItWalletError }) => (
    <ItwErrorView
      error={error}
      type="SingleButton"
      leftButton={cancelButtonProps(navigation.goBack)}
    />
  );

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
          onPress: () => null
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          accessibilityLabel: I18n.t("global.buttons.cancel"),
          onPress: () => showCancelAlert(alertOnPress)
        }}
      />
    </SafeAreaView>
  );

  const RenderMask = () =>
    pot.fold(
      checksPot,
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

export default ItwPresentationChecksScreen;
