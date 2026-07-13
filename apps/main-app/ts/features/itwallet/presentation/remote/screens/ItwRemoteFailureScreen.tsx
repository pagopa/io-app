import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "i18next";

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
import { useItwRemoteUntrustedRPBottomSheet } from "../hooks/useItwRemoteUntrustedRPBottomSheet.tsx";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog.tsx";
import { useItwFailureSupportModal } from "../../../common/hooks/useItwFailureSupportModal.tsx";
import { ZendeskSubcategoryValue } from "../../../common/hooks/useItwZendeskSupport";
import { useItwSendAuthorizationErrorResponse } from "../hooks/useItwSendAuthorizationErrorResponse.tsx";
import { useItwRemoteEventsTracking } from "../hooks/useItwRemoteEventsTracking";
import { trackItwRemoteInvalidAuthResponseBottomSheet } from "../analytics";
import { getDismissalContextFromFailure } from "../analytics/utils";
import { trackItwKoStateAction } from "../../../analytics";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences.ts";
import { itwCredentialNameResolverSelector } from "../../../credentialsCatalogue/store/selectors";
import { ItwPresentationMissingCredentialsFailureContent } from "../../common/components/ItwPresentatioMissingCredentialsFailureContent.tsx";

const zendeskAssistanceErrors = [
  RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE,
  RemoteFailureType.UNEXPECTED
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
  const isWhitelisted = useIOSelector(itwIsL3EnabledSelector);
  const machineRef = ItwRemoteMachineContext.useActorRef();
  const resolveCredentialName = useIOSelector(
    itwCredentialNameResolverSelector
  );
  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  const dismissalContext = getDismissalContextFromFailure(failure.type);

  useItwRemoteEventsTracking({ failure });

  const { bottomSheet, present } = useItwRemoteUntrustedRPBottomSheet();
  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "close" }),
    customLabels: {
      body: I18n.t(
        "features.itWallet.presentation.remote.walletInactiveScreen.alert.body"
      )
    },
    dismissalContext
  });

  const failureSupportModal = useItwFailureSupportModal({
    failure,
    supportChatEnabled: zendeskAssistanceErrors.includes(failure.type),
    zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA
  });

  const closeMachine = () => machineRef.send({ type: "close" });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case RemoteFailureType.WALLET_INACTIVE:
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.walletInactiveScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.walletInactiveScreen.subtitle"
            ),
            pictogram: "itWallet",
            action:
              // Prevent non-whitelisted users from activating IT-Wallet
              isWhitelisted
                ? {
                    label: I18n.t(
                      "features.itWallet.presentation.remote.walletInactiveScreen.primaryAction"
                    ),
                    onPress: () => {
                      trackItwKoStateAction({
                        reason: failure,
                        cta_category: "custom_1",
                        cta_id: I18n.t(
                          "features.itWallet.presentation.remote.walletInactiveScreen.primaryAction"
                        )
                      });
                      machineRef.send({ type: "go-to-wallet-activation" });
                    }
                  }
                : undefined,
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.walletInactiveScreen.secondaryAction"
              ),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure,
                  cta_category: "custom_2",
                  cta_id: I18n.t(
                    "features.itWallet.presentation.remote.walletInactiveScreen.secondaryAction"
                  )
                });
                dismissalDialog.show();
              }
            }
          };
        case RemoteFailureType.EID_EXPIRED: {
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.eidExpiredScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.eidExpiredScreen.subtitle"
            ),
            pictogram: "identity",
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
              onPress: closeMachine
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
              onPress: closeMachine
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.relyingParty.invalidAuthResponse.secondaryAction"
              ),
              onPress: () => {
                trackItwRemoteInvalidAuthResponseBottomSheet();
                failureSupportModal.present();
              }
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
              onPress: closeMachine
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
              onPress: closeMachine
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
        case RemoteFailureType.INVALID_CREDENTIALS_STATUS: {
          const { invalidCredentials } = failure.reason;
          const count = invalidCredentials.length;
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.invalidCredentialsScreen.title",
              {
                count,
                credentialName: resolveCredentialName(invalidCredentials[0])
              }
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.invalidCredentialsScreen.subtitle",
              {
                count
              }
            ),
            pictogram: "accessDenied",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.invalidCredentialsScreen.primaryAction"
              ),
              onPress: closeMachine
            }
          };
        }
        case RemoteFailureType.UNEXPECTED:
        default:
          return {
            title: I18n.t(
              "features.itWallet.presentation.remote.unexpectedErrorScreen.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.remote.unexpectedErrorScreen.subtitle"
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.remote.unexpectedErrorScreen.primaryAction"
              ),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure,
                  cta_category: "custom_1",
                  cta_id: I18n.t(
                    "features.itWallet.presentation.remote.unexpectedErrorScreen.primaryAction"
                  )
                });
                closeMachine();
              }
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.remote.unexpectedErrorScreen.secondaryAction"
              ),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure,
                  cta_category: "custom_2",
                  cta_id: I18n.t(
                    "features.itWallet.presentation.remote.unexpectedErrorScreen.secondaryAction"
                  )
                });
                failureSupportModal.present();
              }
            }
          };
      }
    };

  const resultScreenProps = getOperationResultScreenContentProps();

  useItwSendAuthorizationErrorResponse({ failure, resultScreenProps });

  if (failure.type === RemoteFailureType.MISSING_CREDENTIALS) {
    return (
      <ItwPresentationMissingCredentialsFailureContent
        credentialTypes={failure.reason.missingCredentials}
        onClose={() => machineRef.send({ type: "close" })}
      />
    );
  }

  return (
    <>
      <OperationResultScreenContent {...resultScreenProps} />
      {bottomSheet}
      {failureSupportModal.bottomSheet}
    </>
  );
};
