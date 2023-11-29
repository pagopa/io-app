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
import ItwContinueScreen from "../../../../components/ItwContinueView";
import I18n from "../../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { getRpMock } from "../../../../utils/mocks";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import ItwKoView from "../../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../../utils/errors/itwErrorsMapping";

/**
 * This screen is used to perform different checks before initiating the presentation flow.
 * It shows a loading spinner while the checks are being performed and then it shows a success screen with the name of the relaying party if the checks are successful.
 * It shows an error screen if the checks fail.
 * The view is rendered based on the state of the checks pot.
 */
const ItwPrRemoteCredentialChecksScreen = () => {
  const dispatch = useIODispatch();
  const checksPot = useIOSelector(itwPresentationChecksSelector);
  const navigation =
    useNavigation<IOStackNavigationProp<ItwParamsList & AppParamsList>>();
  const rpMock = getRpMock();

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

  const ErrorView = () => {
    const onPress = () => navigation.goBack();
    const mappedError = getItwGenericMappedError(onPress);
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
      checksPot,
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

export default ItwPrRemoteCredentialChecksScreen;
