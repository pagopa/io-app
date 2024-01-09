import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Banner,
  Body,
  ButtonSolidProps,
  H2,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { SafeAreaView, View } from "react-native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import ItwCredentialCard from "../../../components/ItwCredentialCard";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import ItwCredentialClaimsList from "../../../components/ItwCredentialClaimsList";
import { itwShowCancelAlert } from "../../../utils/itwAlertsUtils";
import ROUTES from "../../../../../navigation/routes";
import ItwKoView from "../../../components/ItwKoView";
import {
  getItwGenericMappedError,
  ItWalletError
} from "../../../utils/itwErrorsUtils";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  itwConfirmStoreCredential,
  itwIssuanceCredential
} from "../../../store/actions/itwIssuanceCredentialActions";
import { itwIssuanceCredentialResultSelector } from "../../../store/reducers/itwIssuanceCredentialReducer";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";
import { ForceScrollDownView } from "../../../../../components/ForceScrollDownView";
import ItwFooterVerticalButtons from "../../../components/ItwFooterVerticalButtons";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { StoredCredential } from "../../../utils/itwTypesUtils";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the credential.
 */
const ItwIssuingCredentialPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const issuanceResult = useIOSelector(itwIssuanceCredentialResultSelector);
  const bannerViewRef = React.createRef<View>();
  const toast = useIOToast();
  const dispatch = useIODispatch();

  /**
   * Starts the issuance process when the screen is rendered for the first time.
   */
  useOnFirstRender(() => {
    dispatch(itwIssuanceCredential.request());
  });

  /**
   * Alert to show when the user presses the cancel button.
   */
  const alertOnPress = () => {
    toast.info(
      I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
    );
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
  };

  /**
   * Content view which asks the user to confirm the issuance of the credential.
   * @param data - the issuance result data of the credential used to display the credential.
   */
  const ContentView = ({ data }: { data: StoredCredential }) => {
    const addOnPress = () => {
      dispatch(itwConfirmStoreCredential());
    };

    const bottomButtonProps: ButtonSolidProps = {
      fullWidth: true,
      color: "contrast",
      label: I18n.t("global.buttons.cancel"),
      accessibilityLabel: I18n.t("global.buttons.cancel"),
      onPress: () => itwShowCancelAlert(alertOnPress)
    };

    const topButtonProps: ButtonSolidProps = {
      fullWidth: true,
      color: "primary",
      label: I18n.t("global.buttons.add"),
      accessibilityLabel: I18n.t("global.buttons.add"),
      onPress: () => addOnPress()
    };

    return (
      <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
        <SafeAreaView style={IOStyles.flex}>
          <ForceScrollDownView>
            <View style={IOStyles.horizontalContentPadding}>
              <H2>
                {I18n.t(
                  "features.itWallet.issuing.credentialPreviewScreen.title"
                )}
              </H2>
              <VSpacer />
              <Body>
                {I18n.t(
                  "features.itWallet.issuing.credentialPreviewScreen.subtitle"
                )}
              </Body>
              <VSpacer />
              <ItwCredentialCard
                parsedCredential={data.parsedCredential}
                display={data.displayData}
                type={data.credentialType}
              />
              <VSpacer />
              <ItwCredentialClaimsList data={data} />
              <VSpacer size={32} />
              <Banner
                testID={"ItwBannerTestID"}
                viewRef={bannerViewRef}
                color={"neutral"}
                size="big"
                title={I18n.t(
                  "features.itWallet.issuing.credentialPreviewScreen.banner.title"
                )}
                content={I18n.t(
                  "features.itWallet.issuing.credentialPreviewScreen.banner.content"
                )}
                pictogramName={"security"}
                action={I18n.t(
                  "features.itWallet.issuing.credentialPreviewScreen.banner.actionTitle"
                )}
                onPress={() =>
                  navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
                }
              />
              <VSpacer size={32} />
            </View>

            <ItwFooterVerticalButtons
              bottomButtonProps={bottomButtonProps}
              topButtonProps={topButtonProps}
            />
          </ForceScrollDownView>
        </SafeAreaView>
      </BaseScreenComponent>
    );
  };

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  /**
   * Loading view component.
   */
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

  const RenderMask = () =>
    pot.fold(
      issuanceResult,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <ErrorView />,
      () => <ErrorView />,
      data =>
        pipe(
          data,
          O.fold(
            () => <ErrorView />,
            some => <ContentView data={some} />
          )
        ),
      () => <LoadingView />,
      () => <ErrorView />,
      (_, error) => <ErrorView error={error} />
    );

  return <RenderMask />;
};

export default ItwIssuingCredentialPreviewScreen;
