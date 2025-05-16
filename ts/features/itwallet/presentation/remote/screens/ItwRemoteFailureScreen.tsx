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
import { useItwRemoteUntrustedRPBottomSheet } from "../hooks/useItwRemoteUntrustedRPBottomSheet.tsx";
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
  const i18nNs = "features.itWallet.presentation.remote"; // Common i18n namespace

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  const { bottomSheet, present } = useItwRemoteUntrustedRPBottomSheet();
  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "close" }),
    customBodyMessage: I18n.t(`${i18nNs}.walletInactiveScreen.alert.body`)
  });

  const failureSupportModal = useItwFailureSupportModal({
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
            title: I18n.t(`${i18nNs}.walletInactiveScreen.title`),
            subtitle: I18n.t(`${i18nNs}.walletInactiveScreen.subtitle`),
            pictogram: "itWallet",
            action: {
              label: I18n.t(`${i18nNs}.walletInactiveScreen.primaryAction`),
              onPress: () =>
                machineRef.send({ type: "go-to-wallet-activation" })
            },
            secondaryAction: {
              label: I18n.t(`${i18nNs}.walletInactiveScreen.secondaryAction`),
              onPress: dismissalDialog.show
            }
          };
        case RemoteFailureType.MISSING_CREDENTIALS: {
          const { missingCredentials } = failure.reason;
          const count = missingCredentials.length;
          return {
            title: I18n.t(`${i18nNs}.missingCredentialsScreen.title`, {
              count,
              defaultValue: I18n.t(
                `${i18nNs}.missingCredentialsScreen.title.other`,
                { count }
              )
            }),
            subtitle: I18n.t(`${i18nNs}.missingCredentialsScreen.subtitle`, {
              credentialNames: missingCredentials
                .map(c => getCredentialNameFromType(c))
                .join(", ")
            }),
            pictogram: "emptyWallet",
            action: {
              label: I18n.t(
                `${i18nNs}.missingCredentialsScreen.primaryAction`,
                {
                  count,
                  defaultValue: I18n.t(
                    `${i18nNs}.missingCredentialsScreen.primaryAction.other`,
                    { count }
                  )
                }
              ),
              onPress: () =>
                navigation.navigate(
                  ITW_ROUTES.MAIN,
                  count === 1
                    ? {
                        screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
                        params: { credentialType: missingCredentials[0] }
                      }
                    : { screen: ITW_ROUTES.ONBOARDING }
                )
            },
            secondaryAction: {
              label: I18n.t(
                `${i18nNs}.missingCredentialsScreen.secondaryAction`
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        }
        case RemoteFailureType.EID_EXPIRED: {
          return {
            title: I18n.t(`${i18nNs}.eidExpiredScreen.title`),
            subtitle: I18n.t(`${i18nNs}.eidExpiredScreen.subtitle`),
            pictogram: "identityRefresh",
            action: {
              label: I18n.t(`${i18nNs}.eidExpiredScreen.primaryAction`),
              onPress: () =>
                machineRef.send({ type: "go-to-identification-mode" })
            },
            secondaryAction: {
              label: I18n.t(`${i18nNs}.eidExpiredScreen.secondaryAction`),
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
              onPress: failureSupportModal.present
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
        case RemoteFailureType.INVALID_REQUEST_OBJECT: {
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.relyingParty.invalidRequestObject.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.relyingParty.invalidRequestObject.subtitle"
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.relyingParty.invalidRequestObject.primaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        }
        case RemoteFailureType.UNTRUSTED_RP: {
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.untrustedRpScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.untrustedRpScreen.subtitle"
            ),
            pictogram: "stopSecurity",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.untrustedRpScreen.primaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.untrustedRpScreen.secondaryAction"
              ),
              onPress: present
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
      {failureSupportModal.bottomSheet}
    </>
  );
};
