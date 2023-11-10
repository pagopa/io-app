import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Banner,
  BlockButtonProps,
  Body,
  FooterWithButtons,
  H2,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native-gesture-handler";
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
import { useItwInfoBottomSheet } from "../../../hooks/useItwInfoBottomSheet";
import { showCancelAlert } from "../../../utils/alert";
import ROUTES from "../../../../../navigation/routes";
import ItwKoView from "../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../utils/errors/itwErrorsMapping";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  itwConfirmStoreCredential,
  itwIssuanceGetCredential
} from "../../../store/actions/new/itwIssuanceActions";
import {
  IssuanceResultData,
  itwIssuanceResultDataSelector,
  itwIssuanceResultSelector
} from "../../../store/reducers/new/itwIssuanceReducer";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the credential.
 */
const ItwCredentialPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const issuanceResult = useIOSelector(itwIssuanceResultSelector);
  const issuanceResultData = useIOSelector(itwIssuanceResultDataSelector);
  const bannerViewRef = React.createRef<View>();
  const toast = useIOToast();
  const dispatch = useIODispatch();

  /**
   * Starts the issuance process when the screen is rendered for the first time.
   */
  useOnFirstRender(() => {
    dispatch(itwIssuanceGetCredential.request());
  });

  /**
   * Bottom sheet with the issuer information.
   */
  const { present, bottomSheet } = useItwInfoBottomSheet({
    title: O.isSome(issuanceResultData)
      ? issuanceResultData.value.issuerName
      : "",
    content: [
      {
        title: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.title"
        ),
        body: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.about.subtitle"
        )
      },
      {
        title: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.title"
        ),
        body: I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.bottomSheet.data.subtitle"
        )
      }
    ]
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
  const ContentView = ({ data }: { data: IssuanceResultData }) => {
    const addOnPress = () => {
      dispatch(itwConfirmStoreCredential());
    };

    const confirmButtonProps: BlockButtonProps = {
      type: "Solid",
      buttonProps: {
        label: I18n.t("global.buttons.add"),
        accessibilityLabel: I18n.t("global.buttons.add"),
        onPress: () => addOnPress()
      }
    };

    const cancelButtonProps: BlockButtonProps = {
      type: "Outline",
      buttonProps: {
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: () => showCancelAlert(alertOnPress)
      }
    };

    return (
      <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView contentContainerStyle={IOStyles.horizontalContentPadding}>
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
                "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.title"
              )}
              content={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.subtitle",
                {
                  issuer: data.issuerName
                }
              )}
              pictogramName={"security"}
              action={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.action"
              )}
              onPress={present}
            />
            <VSpacer size={32} />
          </ScrollView>
          <FooterWithButtons
            type="TwoButtonsInlineHalf"
            primary={cancelButtonProps}
            secondary={confirmButtonProps}
          />
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

  const RenderMask = pot.fold(
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

  return (
    <>
      {RenderMask}
      {bottomSheet}
    </>
  );
};

export default ItwCredentialPreviewScreen;
