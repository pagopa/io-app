import React from "react";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Banner,
  BlockButtonProps,
  Body,
  FooterWithButtons,
  H2,
  H6,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView, View } from "react-native";
import ItwCredentialCard from "../../components/ItwCredentialCard";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import ItwCredentialClaimsList from "../../components/ItwCredentialClaimsList";
import { useItwInfoBottomSheet } from "../../hooks/useItwInfoBottomSheet";
import { showCancelAlert } from "../../utils/alert";
import ROUTES from "../../../../navigation/routes";
import ItwKoView from "../../components/ItwKoView";
import { getItwGenericMappedError } from "../../utils/errors/itwErrorsMapping";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  itwCancelStoreCredential,
  itwConfirmStoreCredential,
  itwIssuanceUserAuthorization
} from "../../store/actions/new/itwIssuanceActions";
import {
  IssuanceResultData,
  itwIssuanceDataSelector,
  itwIssuanceResultDataSelector
} from "../../store/reducers/new/itwIssuanceReducer";
import { ItWalletError } from "../../utils/errors/itwErrors";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the credential.
 */
const ItwCredentialPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const issuanceResultData = useIOSelector(itwIssuanceResultDataSelector);
  const issuanceData = useIOSelector(itwIssuanceDataSelector);

  const bannerViewRef = React.createRef<View>();

  const toast = useIOToast();
  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(itwIssuanceUserAuthorization.request());
  });

  const { present, bottomSheet } = useItwInfoBottomSheet({
    title: pot.isSome(issuanceResultData)
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

  const alertOnPress = () => {
    toast.info(
      I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
    );
    dispatch(itwCancelStoreCredential());
    navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
  };

  /**
   * Renders the content of the screen if the credential is some.
   * @param credential - credential to be displayed
   */
  const ContentView = ({ data }: { data: IssuanceResultData }) => {
    const addOnPress = () => {
      dispatch(itwConfirmStoreCredential());
    };

    /**
     * Button props for the FooterWithButtons component which opens the PIN screen.
     */
    const confirmButtonProps: BlockButtonProps = {
      type: "Solid",
      buttonProps: {
        label: I18n.t("global.buttons.add"),
        accessibilityLabel: I18n.t("global.buttons.add"),
        onPress: () => addOnPress() // TODO(SIW-449): Add navigation to the PIN screen
      }
    };

    /**
     * Button props for the FooterWithButtons component which opens an alert screen.
     */
    const cancelButtonProps: BlockButtonProps = {
      type: "Outline",
      buttonProps: {
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: () => showCancelAlert(alertOnPress)
      }
    };

    return (
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView contentContainerStyle={IOStyles.horizontalContentPadding}>
          <H2>
            {I18n.t("features.itWallet.issuing.credentialPreviewScreen.title")}
          </H2>
          <VSpacer />
          <Body>
            {I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.subtitle"
            )}
          </Body>
          <VSpacer />
          <ItwCredentialCard
            name={data.parsedCredential.name}
            fiscalCode={data.parsedCredential.fiscalCode}
            display={data.schema.display}
          />
          <VSpacer />
          <ItwCredentialClaimsList data={data} />
          <VSpacer size={32} />
          <H6>
            {I18n.t(
              "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.title"
            )}
          </H6>
          <Body>
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
              pictogramName={"itWallet"}
              action={I18n.t(
                "features.itWallet.issuing.credentialPreviewScreen.somethingWrong.action"
              )}
              onPress={present}
            />
          </Body>
          <VSpacer size={32} />
        </ScrollView>
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          primary={cancelButtonProps}
          secondary={confirmButtonProps}
        />
      </SafeAreaView>
    );
  };

  // Checks failed
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    // TODO: handle contextual error
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  // A generic erro view for cases not mapped
  const Panic = ({ label: _ = "unknown" }: { label?: string }) => <ErrorView />;

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
    issuanceResultData,
    /* foldNone */ () => <LoadingView />,
    /* foldNoneLoading */ () => <LoadingView />,
    /* foldNoneUpdating */ () => <Panic label="unexpected foldNoneUpdating" />,
    /* foldNoneError */ () => <ErrorView />,
    /* foldSome */ data => <ContentView data={data} />,
    /* foldSomeLoading */ () => <Panic label="unexpected foldSomeLoading" />,
    /* foldSomeUpdating */ () => <Panic label="unexpected foldSomeUpdating" />,
    /* foldSomeError */ (_, error) => <ErrorView error={error} />
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      {RenderMask}
      {bottomSheet}
    </BaseScreenComponent>
  );
};

export default ItwCredentialPreviewScreen;
