import {
  ContentWrapper,
  H2,
  IOColors,
  IOMarkdown,
  VSpacer
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";

import type { CredentialIssuanceMode } from "../../machine/credential/context";

import introHeroSource from "../../../../../img/features/itWallet/issuance/intro_hero.png";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { getMixPanelCredential } from "../../analytics/utils";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import { itwCredentialIntroContentSelector } from "../../credentialsCatalogue/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialType,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import {
  trackItwCredentialIntro,
  trackItwCredentialStartIssuing
} from "../analytics";

const introHeroUri = Image.resolveAssetSource(introHeroSource).uri;

export type ItwIssuanceCredentialIntroductionNavigationParams = {
  animationEnabled?: boolean;
  credentialType?: string;
  mode?: CredentialIssuanceMode;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_INTRODUCTION"
>;

export const ItwIssuanceCredentialIntroductionScreen = (props: ScreenProps) => {
  const { credentialType, mode } = props.route.params ?? {};

  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const machineCredentialType =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialType);

  useHeaderSecondLevel({
    title: ""
  });

  // Send the requested credential type to the machine when the issuance flow
  // directly starts from this screen and not from the credentials catalog.
  useFocusEffect(
    useCallback(() => {
      if (credentialType) {
        machineRef.send({
          type: "select-credential",
          credentialType,
          mode: mode ?? "issuance"
        });
      }
    }, [credentialType, machineRef, mode])
  );

  // A missing credential type should never happen at this point
  return machineCredentialType ? (
    <ContentView credentialType={machineCredentialType} />
  ) : (
    <ItwGenericErrorContent />
  );
};

type ContentViewProps = {
  credentialType: string;
};

export const ContentView = ({ credentialType }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const markdownContent =
    useIOSelector(itwCredentialIntroContentSelector(credentialType)) ?? "";
  const credentialName = useItwCredentialName(credentialType);
  const mixPanelCredential = useMemo(
    () => getMixPanelCredential(credentialType, isItwL3),
    [credentialType, isItwL3]
  );

  useFocusEffect(
    useCallback(() => {
      trackItwCredentialIntro(mixPanelCredential);
    }, [mixPanelCredential])
  );

  const handleContinue = useCallback(() => {
    trackItwCredentialStartIssuing(mixPanelCredential);
    machineRef.send({ type: "continue" });
  }, [machineRef, mixPanelCredential]);

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
        <H2>{credentialName}</H2>
        <VSpacer size={16} />
        <View style={styles.contentBox}>
          <IOMarkdown content={markdownContent} />
        </View>
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
