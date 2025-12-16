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
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { useItwRemoteUntrustedRPBottomSheet } from "../hooks/useItwRemoteUntrustedRPBottomSheet.tsx";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog.tsx";
import {
  useItwFailureSupportModal,
  ZendeskSubcategoryValue
} from "../../../common/hooks/useItwFailureSupportModal.tsx";
import { useItwSendAuthorizationErrorResponse } from "../hooks/useItwSendAuthorizationErrorResponse.tsx";
import { useItwRemoteEventsTracking } from "../hooks/useItwRemoteEventsTracking";
import {
  getDismissalContextFromFailure,
  trackItwRemoteInvalidAuthResponseBottomSheet
} from "../analytics";
import { trackItwKoStateAction } from "../../../analytics";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences.ts";

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
  const navigation = useIONavigation();
  const i18nNs = "features.itWallet.presentation.remote"; // Common i18n namespace

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  const dismissalContext = getDismissalContextFromFailure(failure.type);

  const { bottomSheet, present } = useItwRemoteUntrustedRPBottomSheet();
  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "close" }),
    customLabels: {
      body: I18n.t(`${i18nNs}.walletInactiveScreen.alert.body`)
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
        case RemoteFailureType.UNEXPECTED:
          return {
            title: I18n.t(`${i18nNs}.unexpectedErrorScreen.title`),
            subtitle: I18n.t(`${i18nNs}.unexpectedErrorScreen.subtitle`),
            pictogram: "umbrella",
            action: {
              label: I18n.t(`${i18nNs}.unexpectedErrorScreen.primaryAction`),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure,
                  cta_category: "custom_1",
                  cta_id: I18n.t(
                    `${i18nNs}.unexpectedErrorScreen.primaryAction`
                  )
                });
                closeMachine();
              }
            },
            secondaryAction: {
              label: I18n.t(`${i18nNs}.unexpectedErrorScreen.secondaryAction`),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure,
                  cta_category: "custom_2",
                  cta_id: I18n.t(
                    `${i18nNs}.unexpectedErrorScreen.secondaryAction`
                  )
                });
                failureSupportModal.present();
              }
            }
          };
        case RemoteFailureType.WALLET_INACTIVE:
          return {
            title: I18n.t(`${i18nNs}.walletInactiveScreen.title`),
            subtitle: I18n.t(`${i18nNs}.walletInactiveScreen.subtitle`),
            pictogram: "itWallet",
            action:
              // Prevent non-whitelisted users from activating IT-Wallet
              isWhitelisted
                ? {
                    label: I18n.t(
                      `${i18nNs}.walletInactiveScreen.primaryAction`
                    ),
                    onPress: () => {
                      trackItwKoStateAction({
                        reason: failure,
                        cta_category: "custom_1",
                        cta_id: I18n.t(
                          `${i18nNs}.walletInactiveScreen.primaryAction`
                        )
                      });
                      machineRef.send({ type: "go-to-wallet-activation" });
                    }
                  }
                : undefined,
            secondaryAction: {
              label: I18n.t(`${i18nNs}.walletInactiveScreen.secondaryAction`),
              onPress: () => {
                trackItwKoStateAction({
                  reason: failure,
                  cta_category: "custom_2",
                  cta_id: I18n.t(
                    `${i18nNs}.walletInactiveScreen.secondaryAction`
                  )
                });
                dismissalDialog.show();
              }
            }
          };
        case RemoteFailureType.MISSING_CREDENTIALS: {
          const { missingCredentials } = failure.reason;
          const count = missingCredentials.length;
          return {
            title: I18n.t(`${i18nNs}.missingCredentialsScreen.title`, {
              count
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
                  count
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
              onPress: dismissalDialog.show
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
              onPress: closeMachine
            }
          };
        }
        case RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE: {
          return {
            title: I18n.t(`${i18nNs}.relyingParty.invalidAuthResponse.title`),
            subtitle: I18n.t(
              `${i18nNs}.relyingParty.invalidAuthResponse.subtitle`
            ),
            pictogram: "stopSecurity",
            action: {
              label: I18n.t(
                `${i18nNs}.relyingParty.invalidAuthResponse.primaryAction`
              ),
              onPress: closeMachine
            },
            secondaryAction: {
              label: I18n.t(
                `${i18nNs}.relyingParty.invalidAuthResponse.secondaryAction`
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
            title: I18n.t(`${i18nNs}.relyingParty.genericError.title`),
            subtitle: I18n.t(`${i18nNs}.relyingParty.genericError.subtitle`),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                `${i18nNs}.relyingParty.genericError.primaryAction`
              ),
              onPress: () => machineRef.send({ type: "go-to-barcode-scan" })
            },
            secondaryAction: {
              label: I18n.t(
                `${i18nNs}.relyingParty.genericError.secondaryAction`
              ),
              onPress: closeMachine
            }
          };
        }
        case RemoteFailureType.INVALID_REQUEST_OBJECT: {
          return {
            title: I18n.t(`${i18nNs}.relyingParty.invalidRequestObject.title`),
            subtitle: I18n.t(
              `${i18nNs}.relyingParty.invalidRequestObject.subtitle`
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                `${i18nNs}.relyingParty.invalidRequestObject.primaryAction`
              ),
              onPress: closeMachine
            }
          };
        }
        case RemoteFailureType.UNTRUSTED_RP: {
          return {
            title: I18n.t(`${i18nNs}.untrustedRpScreen.title`),
            subtitle: I18n.t(`${i18nNs}.untrustedRpScreen.subtitle`),
            pictogram: "stopSecurity",
            action: {
              label: I18n.t(`${i18nNs}.untrustedRpScreen.primaryAction`),
              onPress: () => machineRef.send({ type: "close" })
            },
            secondaryAction: {
              label: I18n.t(`${i18nNs}.untrustedRpScreen.secondaryAction`),
              onPress: present
            }
          };
        }
        case RemoteFailureType.INVALID_CREDENTIALS_STATUS: {
          const { invalidCredentials } = failure.reason;
          const count = invalidCredentials.length;
          return {
            title: I18n.t(`${i18nNs}.invalidCredentialsScreen.title`, {
              count,
              credentialName: getCredentialNameFromType(invalidCredentials[0])
            }),
            subtitle: I18n.t(`${i18nNs}.invalidCredentialsScreen.subtitle`, {
              count
            }),
            pictogram: "accessDenied",
            action: {
              label: I18n.t(`${i18nNs}.invalidCredentialsScreen.primaryAction`),
              onPress: closeMachine
            }
          };
        }
      }
    };

  useItwRemoteEventsTracking({ failure });

  const resultScreenProps = getOperationResultScreenContentProps();

  useItwSendAuthorizationErrorResponse({ failure, resultScreenProps });

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
