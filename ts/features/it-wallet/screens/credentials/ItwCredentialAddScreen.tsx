import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIOToast } from "@pagopa/io-app-design-system";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import I18n from "../../../../i18n";
import ItwErrorView from "../../components/ItwErrorView";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

import ROUTES from "../../../../navigation/routes";
import { itwAddCredential } from "../../store/actions/itwCredentialsActions";
import { itwAddCredentialSelector } from "../../store/reducers/itwAddCredentialReducer";

/**
 * An intermediate screen which displays a loading screen while adding a credential.
 * Shows an error screen if the adding fails.
 */
const ItwCredentialAddScreen = () => {
  const itwCredentialResult = useIOSelector(itwAddCredentialSelector);
  const navigation =
    useNavigation<IOStackNavigationProp<ItwParamsList & AppParamsList>>();
  const dispatch = useIODispatch();
  const toast = useIOToast();

  useOnFirstRender(() => {
    dispatch(itwAddCredential.request());
  });

  /**
   * Callback to be used in case of success navigate to wallet home and show a toast.
   */
  const navigateToWalletHome = () => {
    toast.success(
      I18n.t("features.itWallet.issuing.credentialAddScreen.toast.success")
    );
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.ITWALLET_HOME });
  };

  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle={I18n.t(
        "features.itWallet.issuing.credentialAddScreen.loading.title"
      )}
      isLoading={false}
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

  if (pot.isSome(itwCredentialResult)) {
    navigateToWalletHome();
  }

  const RenderMask = () =>
    pot.fold(
      itwCredentialResult,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      _ => <></>,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, err) => <ErrorView error={err} />
    );

  return <RenderMask />;
};

export default ItwCredentialAddScreen;
