import {
  ContentWrapper,
  H2,
  IOColors,
  IOMarkdown,
  VSpacer
} from "@io-app/design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import introHeroSource from "../../../../../img/features/itWallet/issuance/intro_hero.png";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { itwIsL3EnabledSelector } from "../../common/store/selectors";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import {
  itwCredentialsEidStatusSelector,
  itwCredentialSelector
} from "../../credentials/store/selectors";
import { itwCredentialIntroContentSelector } from "../../credentialsCatalogue/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialType,
  selectIsLoading,
  selectResolvedCredentialOffer
} from "../../machine/credential/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

const introHeroUri = Image.resolveAssetSource(introHeroSource).uri;

export type ItwIssuanceCredentialOfferScreenNavigationParams = {
  itwCredentialOfferUri: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_OFFER_INTRO"
>;

const ItwIssuanceCredentialOfferIntroScreen = ({ route }: ScreenProps) => {
  useItwDisableGestureNavigation();

  const startupStatus = useIOSelector(isStartupLoaded);

  if (startupStatus !== StartupStatusEnum.AUTHENTICATED) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return (
    <ContentView credentialOfferUri={route.params.itwCredentialOfferUri} />
  );
};

type ContentViewProps = {
  credentialOfferUri: string;
};

const ContentView = ({ credentialOfferUri }: ContentViewProps) => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const resolvedCredentialOffer =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectResolvedCredentialOffer
    );
  const credentialType =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialType);
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const introductionContent = useIOSelector(
    itwCredentialIntroContentSelector(credentialType)
  );
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const credentialName = useItwCredentialName(credentialType);

  // The offer cannot proceed without an active wallet or with an eID that
  // needs to be renewed: both require the user to complete another flow first.
  const isEidExpiredOrExpiring =
    eidStatus !== undefined &&
    ["jwtExpired", "jwtExpiring"].includes(eidStatus);
  const isOfferBlocked = !isWalletValid || isEidExpiredOrExpiring;

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      machineRef.send({ type: "close" });
      navigation.goBack();
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (resolvedCredentialOffer === undefined) {
        machineRef.send({
          type: "start-credential-offer",
          itwCredentialOfferUri: credentialOfferUri
        });
      }
    }, [machineRef, credentialOfferUri, resolvedCredentialOffer])
  );

  const handleContinue = useCallback(() => {
    machineRef.send({ type: "confirm-credential-offer" });
  }, [machineRef]);

  const storedCredential = useIOSelector(
    itwCredentialSelector(credentialType ?? "")
  );

  // Continuing the offer flow would silently overwrite the stored credential,
  // so it is blocked when the credential is already in the wallet and valid.
  const isCredentialAlreadyAdded =
    storedCredential !== undefined &&
    getCredentialStatus(storedCredential) === "valid";

  const isResolved =
    resolvedCredentialOffer !== undefined && credentialType !== undefined;
  const shouldSkipIntro =
    isResolved &&
    !isCredentialAlreadyAdded &&
    !isOfferBlocked &&
    !introductionContent;

  useEffect(() => {
    if (shouldSkipIntro) {
      handleContinue();
    }
  }, [shouldSkipIntro, handleContinue]);

  if (!isResolved || shouldSkipIntro) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  if (!isWalletValid) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t(
            "features.itWallet.issuance.credentialOffer.activation.primaryAction"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.replace(ITW_ROUTES.DISCOVERY.INFO, {
              animationEnabled: false,
              credentialType,
              level: isL3Enabled ? "l3" : "l2"
            });
          }
        }}
        pictogram="itWallet"
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.popToTop();
          }
        }}
        subtitle={I18n.t(
          "features.itWallet.issuance.credentialOffer.activation.subtitle",
          { credential: credentialName }
        )}
        title={I18n.t(
          "features.itWallet.issuance.credentialOffer.activation.title"
        )}
      />
    );
  }

  if (isEidExpiredOrExpiring) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t(
            "features.itWallet.issuance.confirmIdentity.primaryAction"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.replace(ITW_ROUTES.IDENTIFICATION.MODE_SELECTION, {
              animationEnabled: false,
              credentialType,
              eidReissuing: true,
              level: isL3Enabled ? "l3" : "l2"
            });
          }
        }}
        pictogram="identity"
        secondaryAction={{
          label: I18n.t(
            "features.itWallet.issuance.confirmIdentity.secondaryAction"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.popToTop();
          }
        }}
        subtitle={I18n.t(
          "features.itWallet.issuance.credentialOffer.confirmIdentity.subtitle",
          {
            credential: credentialName,
            wallet: isL3Enabled ? "IT Wallet ID" : "Documenti su IO"
          }
        )}
        title={I18n.t(
          "features.itWallet.issuance.credentialOffer.confirmIdentity.title"
        )}
      />
    );
  }

  if (isCredentialAlreadyAdded && credentialType) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t(
            "features.itWallet.issuance.credentialAlreadyAdded.primaryAction"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.replace(ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL, {
              credentialType
            });
          }
        }}
        pictogram="itWallet"
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.goBack();
          }
        }}
        subtitle={I18n.t(
          "features.itWallet.issuance.credentialAlreadyAdded.body"
        )}
        title={I18n.t(
          "features.itWallet.issuance.credentialAlreadyAdded.title"
        )}
      />
    );
  }

  const fallbackTitle = I18n.t(
    "features.itWallet.issuance.credentialOffer.intro.fallbackTitle"
  );
  const title = getCredentialNameFromType(credentialType, false, fallbackTitle);

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: handleContinue,
          loading: isLoading
        }
      }}
      includeContentMargins={false}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: introHeroUri }}
        style={styles.hero}
      />
      <ContentWrapper style={{ marginTop: 24 }}>
        <H2>{title}</H2>
        <VSpacer size={16} />
        {introductionContent && (
          <View style={styles.contentBox}>
            <IOMarkdown content={introductionContent} />
          </View>
        )}
      </ContentWrapper>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: "auto",
    resizeMode: "cover",
    aspectRatio: 4 / 3,
    opacity: 0.8
  },
  contentBox: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderColor: IOColors["grey-100"]
  }
});

export { ItwIssuanceCredentialOfferIntroScreen };
