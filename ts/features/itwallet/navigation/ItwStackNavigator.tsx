import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import { Platform } from "react-native";
import { ComponentType } from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwAlreadyActiveScreen } from "../discovery/screens/ItwAlreadyActiveScreen";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import ItwIpzsPrivacyScreen from "../discovery/screens/ItwIpzsPrivacyScreen";
import { ItwActivateNfcScreen } from "../identification/screens/ItwActivateNfcScreen.tsx";
import { ItwCieCardReaderL2Screen } from "../identification/screens/cie/ItwCieCardReaderL2Screen";
import { ItwCieCardReaderScreen as ItwCieCardReaderL3Screen } from "../identification/cie/screens/ItwCieCardReaderScreen";
import { ItwCieExpiredOrInvalidScreen } from "../identification/screens/cie/ItwCieExpiredOrInvalidScreen.tsx";
import { ItwCiePinScreen } from "../identification/cie/screens/ItwCiePinScreen.tsx";
import { ItwCieUnexpectedErrorScreen } from "../identification/screens/cie/ItwCieUnexpectedErrorScreen.tsx";
import { ItwCieWrongCardScreen } from "../identification/screens/cie/ItwCieWrongCardScreen.tsx";
import { ItwCieWrongCiePinScreen } from "../identification/screens/cie/ItwCieWrongCiePinScreen.tsx";
import ItwCieIdLoginScreen from "../identification/screens/cieId/ItwCieIdLoginScreen";
import { ItwIdentificationIdpSelectionScreen } from "../identification/screens/ItwIdentificationIdpSelectionScreen";
import ItwSpidIdpLoginScreen from "../identification/screens/spid/ItwSpidIdpLoginScreen";
import { ItwIssuanceCredentialAsyncContinuationScreen } from "../issuance/screens/ItwIssuanceCredentialAsyncContinuationScreen";
import { ItwIssuanceCredentialFailureScreen } from "../issuance/screens/ItwIssuanceCredentialFailureScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../issuance/screens/ItwIssuanceCredentialTrustIssuerScreen";
import { ItwIssuanceEidFailureScreen } from "../issuance/screens/ItwIssuanceEidFailureScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import { ItwIdentityNotMatchingScreen } from "../lifecycle/screens/ItwIdentityNotMatchingScreen";
import { ItwLifecycleWalletRevocationScreen } from "../lifecycle/screens/ItwLifecycleWalletRevocationScreen";
import { WalletCardOnboardingScreen } from "../onboarding/screens/WalletCardOnboardingScreen";
import { ItwPresentationCredentialAttachmentScreen } from "../presentation/details/screens/ItwPresentationCredentialAttachmentScreen";
import { ItwPresentationCredentialCardModal } from "../presentation/details/screens/ItwPresentationCredentialCardModal";
import { ItwPresentationCredentialDetailScreen } from "../presentation/details/screens/ItwPresentationCredentialDetailScreen";
import { ItwPresentationCredentialFiscalCodeModal } from "../presentation/details/screens/ItwPresentationCredentialFiscalCodeModal";
import { ItwPresentationEidVerificationExpiredScreen } from "../presentation/details/screens/ItwPresentationEidVerificationExpiredScreen";
import { ItwCredentialTrustmarkScreen } from "../trustmark/screens/ItwCredentialTrustmarkScreen";
import { ItwOfflineWalletScreen } from "../wallet/screens/ItwOfflineWalletScreen";
import { ItwCiePreparationCardScreen } from "../identification/cie/screens/ItwCiePreparationCardScreen.tsx";
import { ItwCiePreparationPinScreen } from "../identification/cie/screens/ItwCiePreparationPinScreen.tsx";
import { isItwEnabledSelector } from "../common/store/selectors/remoteConfig";
import { ItwGenericErrorContent } from "../common/components/ItwGenericErrorContent";
import { useIOSelector } from "../../../store/hooks";
import { isConnectedSelector } from "../../connectivity/store/selectors";
import { ItwIdentificationCieWarningScreen } from "../identification/screens/ItwIdentificationCieWarningScreen";
import { ItwL3IdentificationModeSelectionScreen } from "../identification/screens/ItwL3IdentificationModeSelectionScreen";
import { ItwL2IdentificationModeSelectionScreen } from "../identification/screens/ItwL2IdentificationModeSelectionScreen";
import {
  ItwProximityMachineContext,
  ItwProximityMachineProvider
} from "../presentation/proximity/machine/provider.tsx";
import { ItwGrantPermissionsScreen } from "../presentation/proximity/screens/ItwGrantPermissionsScreen.tsx";
import { ItwActivateBluetoothScreen } from "../presentation/proximity/screens/ItwActivateBluetoothScreen.tsx";
import { ItwProximityClaimsDisclosureScreen } from "../presentation/proximity/screens/ItwProximityClaimsDisclosureScreen.tsx";
import { ItwProximitySendDocumentsResponseScreen } from "../presentation/proximity/screens/ItwProximitySendDocumentsResponseScreen.tsx";
import { ItwProximityFailureScreen } from "../presentation/proximity/screens/ItwProximityFailureScreen.tsx";
import ItwPlayground from "../playgrounds/screens/ItwPlayground.tsx";
import { ItwL3CredentialDetailScreen } from "../playgrounds/screens/ItwL3CredentialDetailScreen.tsx";
import { ItwPresentationPidDetailScreen } from "../presentation/details/screens/ItwPresentationPidDetailScreen.tsx";
import { ItwIssuanceUpcomingCredentialScreen } from "../issuance/screens/ItwIssuanceUpcomingCredentialScreen";
import {
  ItwEidIssuanceMachineContext,
  ItwEidIssuanceMachineProvider
} from "../machine/eid/provider";
import {
  ItwCredentialIssuanceMachineContext,
  ItwCredentialIssuanceMachineProvider
} from "../machine/credential/provider";
import { ItwIssuanceInactiveITWalletScreen } from "../issuance/screens/ItwIssuanceInactiveITWalletScreen.tsx";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

const hiddenHeader = { headerShown: false };

export const ItwStackNavigator = () => (
  <ItwEidIssuanceMachineProvider>
    <ItwCredentialIssuanceMachineProvider>
      <ItwProximityMachineProvider>
        <InnerNavigator />
      </ItwProximityMachineProvider>
    </ItwCredentialIssuanceMachineProvider>
  </ItwEidIssuanceMachineProvider>
);

const InnerNavigator = () => {
  const eidIssuanceMachineRef = ItwEidIssuanceMachineContext.useActorRef();
  const credentialIssuanceMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();
  const proximityMachineRef = ItwProximityMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_ROUTES.OFFLINE.WALLET}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          eidIssuanceMachineRef.send({ type: "back" });
          credentialIssuanceMachineRef.send({ type: "back" });
          proximityMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_ROUTES.ONBOARDING}
        component={WalletCardOnboardingScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.OFFLINE.WALLET}
        component={ItwOfflineWalletScreen}
        options={{
          gestureEnabled: isGestureEnabled,
          headerShown: false
        }}
      />
      {/* DISCOVERY */}
      <Stack.Screen
        name={ITW_ROUTES.DISCOVERY.INFO}
        component={withItwEnabled(ItwDiscoveryInfoScreen)}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.DISCOVERY.IPZS_PRIVACY}
        component={ItwIpzsPrivacyScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN}
        component={withItwEnabled(ItwAlreadyActiveScreen)}
        options={hiddenHeader}
      />
      {/* IDENTIFICATION */}
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.MODE_SELECTION.L2}
        component={ItwL2IdentificationModeSelectionScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.MODE_SELECTION.L3}
        component={ItwL3IdentificationModeSelectionScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE_WARNING}
        component={ItwIdentificationCieWarningScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.IDP_SELECTION}
        component={ItwIdentificationIdpSelectionScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.SPID.LOGIN}
        component={ItwSpidIdpLoginScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN}
        component={ItwCieIdLoginScreen}
      />
      {/* IDENTIFICATION CIE + PIN */}
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION_SCREEN}
        component={ItwCiePreparationCardScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PIN_PREPARATION_SCREEN}
        component={ItwCiePreparationPinScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN}
        component={ItwCiePinScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.CARD_READER_SCREEN.L2}
        component={ItwCieCardReaderL2Screen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.CARD_READER_SCREEN.L3}
        component={ItwCieCardReaderL3Screen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC}
        component={ItwActivateNfcScreen}
      />
      <Stack.Group
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          ...Platform.select({
            ios: TransitionPresets.ModalSlideFromBottomIOS,
            default: undefined
          })
        }}
      >
        <Stack.Screen
          name={ITW_ROUTES.IDENTIFICATION.CIE.WRONG_PIN}
          component={ItwCieWrongCiePinScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.IDENTIFICATION.CIE.WRONG_CARD}
          component={ItwCieWrongCardScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.IDENTIFICATION.CIE.UNEXPECTED_ERROR}
          component={ItwCieUnexpectedErrorScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.IDENTIFICATION.CIE.CIE_EXPIRED_SCREEN}
          component={ItwCieExpiredOrInvalidScreen}
        />
      </Stack.Group>
      {/* ISSUANCE */}
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_PREVIEW}
        component={ItwIssuanceEidPreviewScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER}
        component={ItwIssuanceCredentialTrustIssuerScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW}
        component={ItwIssuanceCredentialPreviewScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE}
        component={ItwIssuanceCredentialFailureScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_RESULT}
        component={ItwIssuanceEidResultScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_FAILURE}
        component={ItwIssuanceEidFailureScreen}
        options={{ headerShown: false, gestureEnabled: false }}
        /* gestureEnabled to false prevents going back to the loading screen, just go back to the home screen when swiping back.
         * TODO: [SIW-1375] better retry and go back handling logic for the issuance process
         */
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_ASYNC_FLOW_CONTINUATION}
        component={withItwEnabled(ItwIssuanceCredentialAsyncContinuationScreen)}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.UPCOMING_CREDENTIAL}
        component={ItwIssuanceUpcomingCredentialScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.IT_WALLET_INACTIVE}
        component={ItwIssuanceInactiveITWalletScreen}
        options={hiddenHeader}
      />
      {/* CREDENTIAL PRESENTATION */}
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL}
        component={withItwEnabled(ItwPresentationCredentialDetailScreen)}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT}
        component={ItwPresentationCredentialAttachmentScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL}
        component={ItwPresentationCredentialCardModal}
        options={{
          gestureEnabled: false,
          presentation: "transparentModal"
        }}
      />
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_TRUSTMARK}
        component={ItwCredentialTrustmarkScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_FISCAL_CODE_MODAL}
        component={ItwPresentationCredentialFiscalCodeModal}
      />
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.PID_DETAIL}
        component={ItwPresentationPidDetailScreen}
      />
      {/* LIFECYCLE */}
      <Stack.Screen
        name={ITW_ROUTES.IDENTITY_NOT_MATCHING_SCREEN}
        component={ItwIdentityNotMatchingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ITW_ROUTES.WALLET_REVOCATION_SCREEN}
        component={ItwLifecycleWalletRevocationScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.EID_VERIFICATION_EXPIRED}
        component={ItwPresentationEidVerificationExpiredScreen}
        options={{ headerShown: false }}
      />
      {/* Proximity's flow routes */}
      <Stack.Group screenOptions={hiddenHeader}>
        <Stack.Screen
          name={ITW_ROUTES.PROXIMITY.DEVICE_PERMISSIONS}
          component={ItwGrantPermissionsScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.PROXIMITY.BLUETOOTH_ACTIVATION}
          component={ItwActivateBluetoothScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.PROXIMITY.CLAIMS_DISCLOSURE}
          component={ItwProximityClaimsDisclosureScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.PROXIMITY.SEND_DOCUMENTS_RESPONSE}
          component={ItwProximitySendDocumentsResponseScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.PROXIMITY.FAILURE}
          component={ItwProximityFailureScreen}
        />
      </Stack.Group>
      {/* Playground's routes */}
      <Stack.Group screenOptions={hiddenHeader}>
        <Stack.Screen
          name={ITW_ROUTES.PLAYGROUNDS.LANDING}
          component={ItwPlayground}
        />
        <Stack.Screen
          name={ITW_ROUTES.PLAYGROUNDS.CREDENTIAL_DETAIL}
          component={ItwL3CredentialDetailScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

/**
 * A higher-order component which renders the screen only if IT Wallet is enabled.
 * In case IT Wallet is not enabled, it renders an error screen.
 * @param Screen - The screen to render
 * @returns The component or the error screen
 */
const withItwEnabled =
  <P extends Record<string, unknown>>(Screen: ComponentType<P>) =>
  (props: P) => {
    const isItwEnabled = useIOSelector(isItwEnabledSelector);
    const isConnected = useIOSelector(isConnectedSelector);

    // Show error content only if connected and IT Wallet is not enabled
    if (isConnected && !isItwEnabled) {
      return <ItwGenericErrorContent />;
    }
    return <Screen {...props} />;
  };
