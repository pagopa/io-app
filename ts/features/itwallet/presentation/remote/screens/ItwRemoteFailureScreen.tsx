import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { selectFailureOption } from "../machine/selectors.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils.ts";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { RemoteFailure, RemoteFailureType } from "../machine/failure.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import I18n from "../../../../../i18n.ts";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog.tsx";
import {
  useItwFailureSupportModal,
  ZendeskSubcategoryValue
} from "../../../common/hooks/useItwFailureSupportModal.tsx";

const zendeskAssistanceErrors = [
  RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE
];

export const ItwRemoteFailureScreen = () => {
  const failureOption =
    ItwRemoteMachineContext.useSelector(selectFailureOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    failureOption,
    O.fold(constNull, failure => <ContentView failure={failure} />)
  );
};

type ContentViewProps = { failure: RemoteFailure };

const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwRemoteMachineContext.useActorRef();
  const navigation = useIONavigation();

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "close" }),
    customBodyMessage: I18n.t(
      "features.itWallet.presentation.remote.walletInactiveScreen.alert.body"
    )
  });

  const { bottomSheet, present } = useItwFailureSupportModal({
    failure,
    supportChatEnabled: zendeskAssistanceErrors.includes(failure.type),
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case RemoteFailureType.UNEXPECTED:
          return {
            title: I18n.t("features.itWallet.generic.error.title"),
            subtitle: I18n.t("features.itWallet.generic.error.body"),
            pictogram: "workInProgress",
            action: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case RemoteFailureType.WALLET_INACTIVE:
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.walletInactiveScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.walletInactiveScreen.subtitle"
            ),
            pictogram: "itWallet",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.walletInactiveScreen.primaryAction"
              ),
              onPress: () =>
                machineRef.send({ type: "go-to-wallet-activation" })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.walletInactiveScreen.secondaryAction"
              ),
              onPress: dismissalDialog.show
            }
          };
        case RemoteFailureType.MISSING_CREDENTIALS: {
          const [missingCredential] = failure.reason.missingCredentials; // Only consider one credential for now
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.missingCredentialsScreen.title",
              { credentialName: getCredentialNameFromType(missingCredential) }
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.missingCredentialsScreen.subtitle"
            ),
            pictogram: "emptyWallet",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.missingCredentialsScreen.primaryAction"
              ),
              onPress: () =>
                navigation.navigate(ITW_ROUTES.MAIN, {
                  screen: ITW_ROUTES.ONBOARDING
                })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.missingCredentialsScreen.secondaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        }
        case RemoteFailureType.EID_EXPIRED: {
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.eidExpiredScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.eidExpiredScreen.subtitle"
            ),
            pictogram: "identityRefresh",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.eidExpiredScreen.primaryAction"
              ),
              onPress: () =>
                machineRef.send({ type: "go-to-identification-mode" })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.eidExpiredScreen.secondaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        }
        case RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE: {
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.relyingParty.invalidAuthResponse.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.relyingParty.invalidAuthResponse.subtitle"
            ),
            pictogram: "stopSecurity",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.relyingParty.invalidAuthResponse.primaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.relyingParty.invalidAuthResponse.secondaryAction"
              ),
              onPress: present
            }
          };
        }
        case RemoteFailureType.RELYING_PARTY_GENERIC: {
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.relyingParty.genericError.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.relyingParty.genericError.subtitle"
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.relyingParty.genericError.primaryAction"
              ),
              onPress: () => machineRef.send({ type: "go-to-barcode-scan" })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.relyingParty.genericError.secondaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        }
      }
    };

  const resultScreenProps = getOperationResultScreenContentProps();

  return (
    <>
      <OperationResultScreenContent
        {...resultScreenProps}
        subtitleProps={{ textBreakStrategy: "simple" }}
      />
      {bottomSheet}
    </>
  );
};
