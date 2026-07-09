import {
  ContentWrapper,
  H2,
  IOColors,
  IOMarkdown,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
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
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { itwCredentialSelector } from "../../credentials/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialIntroContentOption,
  selectCredentialTypeOption,
  selectResolvedCredentialOfferOption
} from "../../machine/credential/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import introHeroSource from "../../../../../img/features/itWallet/issuance/intro_hero.png";

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
  const resolvedCredentialOfferOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectResolvedCredentialOfferOption
    );
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const introductionContentOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectCredentialIntroContentOption
    );

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      machineRef.send({ type: "close" });
      navigation.goBack();
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (O.isNone(resolvedCredentialOfferOption)) {
        machineRef.send({
          type: "start-credential-offer",
          itwCredentialOfferUri: credentialOfferUri
        });
      }
    }, [machineRef, credentialOfferUri, resolvedCredentialOfferOption])
  );

  const handleContinue = useCallback(() => {
    machineRef.send({ type: "confirm-credential-offer" });
  }, [machineRef]);

  const storedCredentialOption = useIOSelector(
    itwCredentialSelector(O.getOrElse(() => "")(credentialTypeOption))
  );

  // Continuing the offer flow would silently overwrite the stored credential,
  // so it is blocked when the credential is already in the wallet and valid.
  const isCredentialAlreadyAdded =
    O.isSome(storedCredentialOption) &&
    getCredentialStatus(storedCredentialOption.value) === "valid";

  const isResolved =
    O.isSome(resolvedCredentialOfferOption) && O.isSome(credentialTypeOption);
  const shouldSkipIntro =
    isResolved &&
    !isCredentialAlreadyAdded &&
    O.isNone(introductionContentOption);

  useEffect(() => {
    if (shouldSkipIntro) {
      handleContinue();
    }
  }, [shouldSkipIntro, handleContinue]);

  if (!isResolved || shouldSkipIntro) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  if (isCredentialAlreadyAdded) {
    return (
      <OperationResultScreenContent
        pictogram="itWallet"
        title={I18n.t(
          "features.itWallet.issuance.credentialAlreadyAdded.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.issuance.credentialAlreadyAdded.body"
        )}
        action={{
          label: I18n.t(
            "features.itWallet.issuance.credentialAlreadyAdded.primaryAction"
          ),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.replace(ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL, {
              credentialType: credentialTypeOption.value
            });
          }
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: () => {
            machineRef.send({ type: "close" });
            navigation.goBack();
          }
        }}
      />
    );
  }

  const fallbackTitle = I18n.t(
    "features.itWallet.issuance.credentialOffer.intro.fallbackTitle"
  );
  const title = getCredentialNameFromType(
    credentialTypeOption.value,
    false,
    fallbackTitle
  );

  return (
    <IOScrollView
      includeContentMargins={false}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: handleContinue
        }
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: introHeroUri }}
        style={styles.hero}
      />
      <ContentWrapper marginTop={24}>
        <H2>{title}</H2>
        <VSpacer size={16} />
        {O.isSome(introductionContentOption) && (
          <View style={styles.contentBox}>
            <IOMarkdown content={introductionContentOption.value} />
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
