import {
  ContentWrapper,
  H2,
  IOColors,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { sequenceS } from "fp-ts/lib/Apply";
import { useCallback, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import {
  trackItwCredentialIntro,
  trackItwCredentialStartIssuing
} from "../analytics";
import { getMixPanelCredential } from "../../analytics/utils";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import {
  selectCredentialTypeOption,
  selectCredentialIntroContentOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import introHeroSource from "../../../../../img/features/itWallet/issuance/intro_hero.png";

const introHeroUri = Image.resolveAssetSource(introHeroSource).uri;

export const ItwIssuanceCredentialIntroductionScreen = () => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const introductionContentOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectCredentialIntroContentOption
    );

  useHeaderSecondLevel({
    title: "",
    goBack: () => machineRef.send({ type: "back" })
  });

  return pipe(
    sequenceS(O.Monad)({
      credentialType: credentialTypeOption,
      markdownContent: introductionContentOption
    }),
    O.fold(
      () => <ItwGenericErrorContent />, // This should never happen
      innerProps => <ContentView {...innerProps} />
    )
  );
};

type ContentViewProps = {
  credentialType: string;
  markdownContent: string;
};

export const ContentView = ({
  credentialType,
  markdownContent
}: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const credentialName = useItwCredentialName(credentialType);
  const theme = useIOTheme();
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
      includeContentMargins={false}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: handleContinue,
          loading: isLoading
        }
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: introHeroUri }}
        style={styles.hero}
      />
      <ContentWrapper marginTop={24}>
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
