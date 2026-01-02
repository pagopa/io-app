import { Body, H2, VSpacer, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { sequenceS } from "fp-ts/lib/Apply";
import { useCallback, useMemo } from "react";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import {
  trackItwCredentialIntro,
  trackItwCredentialStartIssuing
} from "../analytics";
import { getMixPanelCredential } from "../../analytics/utils/analyticsUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import {
  selectCredentialTypeOption,
  selectCredentialIntroContentOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";

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
    >
      <VStack>
        <H2>{getCredentialNameFromType(credentialType)}</H2>
        <Body>
          {I18n.t("features.itWallet.issuance.credentialIntro.subtitle")}
        </Body>
      </VStack>
      <VSpacer size={16} />
      <IOMarkdown content={markdownContent} />
    </IOScrollView>
  );
};
