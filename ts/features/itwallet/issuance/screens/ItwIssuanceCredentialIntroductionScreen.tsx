import { Body, H2, VSpacer, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { sequenceS } from "fp-ts/lib/Apply";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import {
  selectCredentialTypeOption,
  selectIntroductionTextOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";

export const ItwIssuanceCredentialIntroductionScreen = () => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const introductionTextOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectIntroductionTextOption
    );

  useHeaderSecondLevel({
    title: "",
    goBack: () => machineRef.send({ type: "back" })
  });

  return pipe(
    sequenceS(O.Monad)({
      credentialType: credentialTypeOption,
      markdownContent: introductionTextOption
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

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: () => machineRef.send({ type: "continue" }),
          loading: isLoading
        }
      }}
    >
      <VStack>
        <H2>{getCredentialNameFromType(credentialType)}</H2>
        <Body>Leggi con attenzione cosa troverai</Body>
      </VStack>
      <VSpacer size={16} />
      <IOMarkdown content={markdownContent} />
    </IOScrollView>
  );
};
