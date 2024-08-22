import {
  ContentWrapper,
  ForceScrollDownView,
  H2,
  VSpacer
} from "@pagopa/io-app-design-system";
import { sequenceS } from "fp-ts/lib/Apply";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { useItwDisbleGestureNavigation } from "../../common/hooks/useItwDisbleGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  selectCredentialOption,
  selectCredentialTypeOption,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

export const ItwIssuanceCredentialPreviewScreen = () => {
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const credentialOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialOption
  );
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);

  useItwDisbleGestureNavigation();
  useAvoidHardwareBackButton();

  if (isLoading) {
    return (
      <LoadingScreenContent
        contentTitle={I18n.t(
          "features.itWallet.issuance.credentialPreview.loading"
        )}
      />
    );
  }

  return pipe(
    sequenceS(O.Monad)({
      credentialType: credentialTypeOption,
      credential: credentialOption
    }),
    O.fold(constNull, props => <ContentView {...props} />)
  );
};

type ContentViewProps = {
  credentialType: string;
  credential: StoredCredential;
};

/**
 * Renders the content of the screen
 */
const ContentView = ({ credentialType, credential }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const dispatch = useIODispatch();
  const dismissDialog = useItwDismissalDialog(() =>
    machineRef.send({ type: "close" })
  );

  const handleSaveToWallet = () => {
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () => machineRef.send({ type: "add-to-wallet" })
        }
      )
    );
  };

  useHeaderSecondLevel({
    title: "",
    goBack: dismissDialog.show
  });

  useDebugInfo({
    parsedCredential: credential.parsedCredential
  });

  return (
    <ForceScrollDownView>
      <ContentWrapper>
        <H2>
          {I18n.t("features.itWallet.issuance.credentialPreview.title", {
            credential: getCredentialNameFromType(credentialType)
          })}
        </H2>
        <VSpacer size={24} />
        <ItwCredentialClaimsList data={credential} isPreview={true} />
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            icon: "add",
            iconPosition: "end",
            label: I18n.t(
              "features.itWallet.issuance.credentialPreview.actions.primary"
            ),
            onPress: handleSaveToWallet
          },
          secondary: {
            label: I18n.t(
              "features.itWallet.issuance.credentialPreview.actions.secondary"
            ),
            onPress: dismissDialog.show
          }
        }}
      />
    </ForceScrollDownView>
  );
};
