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
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialTypeOption,
  selectResolvedCredentialOfferOption
} from "../../machine/credential/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwRemoteLoadingScreen } from "../../presentation/remote/components/ItwRemoteLoadingScreen";
import { itwCredentialIntroContentSelector } from "../../credentialsCatalogue/store/selectors";
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
    return <ItwRemoteLoadingScreen title={I18n.t("global.genericWaiting")} />;
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
  const credentialType = O.toUndefined(credentialTypeOption);
  const markdownContent = useIOSelector(
    itwCredentialIntroContentSelector(credentialType)
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

  const isResolved = O.isSome(resolvedCredentialOfferOption) && credentialType;
  const shouldSkipIntro = isResolved && !markdownContent;

  useEffect(() => {
    if (shouldSkipIntro) {
      handleContinue();
    }
  }, [shouldSkipIntro, handleContinue]);

  if (!isResolved || shouldSkipIntro) {
    return <ItwRemoteLoadingScreen title={I18n.t("global.genericWaiting")} />;
  }

  const fallbackTitle = I18n.t(
    "features.itWallet.issuance.credentialOffer.intro.fallbackTitle"
  );
  const title = getCredentialNameFromType(credentialType, false, fallbackTitle);

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
        {markdownContent && (
          <View style={styles.contentBox}>
            <IOMarkdown content={markdownContent} />
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
