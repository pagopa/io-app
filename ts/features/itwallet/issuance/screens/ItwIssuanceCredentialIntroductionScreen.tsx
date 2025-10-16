import { Body, H2, VSpacer, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";

export const ItwIssuanceCredentialIntroductionScreen = () => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );

  useHeaderSecondLevel({
    title: "",
    goBack: () => machineRef.send({ type: "back" })
  });

  return pipe(
    credentialTypeOption,
    O.fold(
      () => <ItwGenericErrorContent />, // This should never happen
      credentialType => <ContentView credentialType={credentialType} />
    )
  );
};

type ContentViewProps = {
  credentialType: string;
};

export const ContentView = ({ credentialType }: ContentViewProps) => {
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
      <IOMarkdown content="Titoli conseguiti con il nuovo ordinamento e i titoli post-laurea dal 2017" />
    </IOScrollView>
  );
};
