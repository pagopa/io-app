import { createStackNavigator } from "@react-navigation/stack";
import { ComponentType, memo } from "react";
import { useIOSelector } from "../../../store/hooks";
import { isGestureEnabled } from "../../../utils/navigation";
import { isConnectedSelector } from "../../connectivity/store/selectors";
import { ItwGenericErrorContent } from "../common/components/ItwGenericErrorContent";
import { isItwEnabledSelector } from "../common/store/selectors/remoteConfig";
import { ItwAlreadyActiveScreen } from "../discovery/screens/ItwAlreadyActiveScreen";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwDiscoveryInfoComponent } from "../discovery/components/ItwDiscoveryInfoComponent.tsx";
import ItwIpzsPrivacyScreen from "../discovery/screens/ItwIpzsPrivacyScreen";
import { ItwActivateNfcScreen } from "../identification/cie/screens/ItwActivateNfcScreen.tsx";
import { ItwCieCanScreen } from "../identification/cie/screens/ItwCieCanScreen.tsx";
import { ItwCieCardReaderScreen as ItwCieCardReaderL3Screen } from "../identification/cie/screens/ItwCieCardReaderScreen";
import { ItwCiePinScreen } from "../identification/cie/screens/ItwCiePinScreen.tsx";
import { ItwCiePreparationCanScreen } from "../identification/cie/screens/ItwCiePreparationCanScreen.tsx";
import { ItwCiePreparationCardScreen } from "../identification/cie/screens/ItwCiePreparationCardScreen.tsx";
import { ItwCiePreparationNfcScreen } from "../identification/cie/screens/ItwCiePreparationNfcScreen.tsx";
import { ItwCiePreparationPinScreen } from "../identification/cie/screens/ItwCiePreparationPinScreen.tsx";
import { ItwIdentificationCieWarningScreen } from "../identification/cie/screens/ItwIdentificationCieWarningScreen.tsx";
import ItwCieIdLoginScreen from "../identification/cieId/screens/ItwCieIdLoginScreen.tsx";
import { ItwIdentificationModeSelectionScreen } from "../identification/common/screens/ItwIdentificationModeSelectionScreen.tsx";
import { ItwIdentificationIdpSelectionScreen } from "../identification/spid/screens/ItwIdentificationIdpSelectionScreen.tsx";
import ItwSpidIdpLoginScreen from "../identification/spid/screens/ItwSpidIdpLoginScreen.tsx";
import { ItwIssuanceEidReissuanceLandingScreen } from "../issuance/screens/ItwIssuanceEidReissuanceLandingScreen";
import { ItwIssuanceCredentialAsyncContinuationScreen } from "../issuance/screens/ItwIssuanceCredentialAsyncContinuationScreen";
import { ItwIssuanceCredentialFailureScreen } from "../issuance/screens/ItwIssuanceCredentialFailureScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../issuance/screens/ItwIssuanceCredentialTrustIssuerScreen";
import { ItwIssuanceEidFailureScreen } from "../issuance/screens/ItwIssuanceEidFailureScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import { ItwIssuanceInactiveITWalletScreen } from "../issuance/screens/ItwIssuanceInactiveITWalletScreen.tsx";
import { ItwIssuanceUpcomingCredentialScreen } from "../issuance/screens/ItwIssuanceUpcomingCredentialScreen";
import { ItwIdentityNotMatchingScreen } from "../lifecycle/screens/ItwIdentityNotMatchingScreen.tsx";
import { ItwLifecycleWalletRevocationScreen } from "../lifecycle/screens/ItwLifecycleWalletRevocationScreen.tsx";
import {
  ItwCredentialIssuanceMachineContext,
  ItwCredentialIssuanceMachineProvider
} from "../machine/credential/provider";
import {
  ItwEidIssuanceMachineContext,
  ItwEidIssuanceMachineProvider
} from "../machine/eid/provider";
import { WalletCardOnboardingScreen } from "../onboarding/screens/WalletCardOnboardingScreen";
import { ItwL3CredentialDetailScreen } from "../playgrounds/screens/ItwL3CredentialDetailScreen.tsx";
import ItwPlayground from "../playgrounds/screens/ItwPlayground.tsx";
import { ItwPresentationCredentialAttachmentScreen } from "../presentation/details/screens/ItwPresentationCredentialAttachmentScreen";
import { ItwPresentationCredentialCardModal } from "../presentation/details/screens/ItwPresentationCredentialCardModal";
import { ItwPresentationCredentialDetailScreen } from "../presentation/details/screens/ItwPresentationCredentialDetailScreen";
import { ItwPresentationCredentialFiscalCodeModal } from "../presentation/details/screens/ItwPresentationCredentialFiscalCodeModal";
import { ItwPresentationEidVerificationExpiredScreen } from "../presentation/details/screens/ItwPresentationEidVerificationExpiredScreen";
import { ItwPresentationPidDetailScreen } from "../presentation/details/screens/ItwPresentationPidDetailScreen.tsx";
import {
  ItwProximityMachineContext,
  ItwProximityMachineProvider
} from "../presentation/proximity/machine/provider.tsx";
import { ItwActivateBluetoothScreen } from "../presentation/proximity/screens/ItwActivateBluetoothScreen.tsx";
import { ItwGrantPermissionsScreen } from "../presentation/proximity/screens/ItwGrantPermissionsScreen.tsx";
import { ItwProximityClaimsDisclosureScreen } from "../presentation/proximity/screens/ItwProximityClaimsDisclosureScreen.tsx";
import { ItwProximityFailureScreen } from "../presentation/proximity/screens/ItwProximityFailureScreen.tsx";
import { ItwProximitySendDocumentsResponseScreen } from "../presentation/proximity/screens/ItwProximitySendDocumentsResponseScreen.tsx";
import { ItwSettingsScreen } from "../settings/screens/ItwSettingsScreen.tsx";
import { ItwCredentialTrustmarkScreen } from "../trustmark/screens/ItwCredentialTrustmarkScreen";
import { ItwOfflineWalletScreen } from "../wallet/screens/ItwOfflineWalletScreen";
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

const InnerNavigator = memo(() => {
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
        name={ITW_ROUTES.IDENTIFICATION.MODE_SELECTION}
        component={ItwIdentificationModeSelectionScreen}
        options={({ route }) => ({
          animationEnabled: route.params.animationEnabled
        })}
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
      {/* IDENTIFICATION CIE */}
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN}
        component={ItwCiePreparationPinScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN}
        component={ItwCiePreparationNfcScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN}
        component={ItwCiePreparationCanScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN}
        component={ItwCiePreparationCardScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN}
        component={ItwCiePinScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN}
        component={ItwCieCanScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.CARD_READER_SCREEN}
        component={ItwCieCardReaderL3Screen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC}
        component={ItwActivateNfcScreen}
      />
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
      {/* Landing screens from deep links */}
      <Stack.Screen
        name={ITW_ROUTES.LANDING_SCREEN.CREDENTIAL_ASYNC_FLOW_CONTINUATION}
        component={withItwEnabled(ItwIssuanceCredentialAsyncContinuationScreen)}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.LANDING_SCREEN.EID_REISSUANCE}
        component={withItwEnabled(ItwIssuanceEidReissuanceLandingScreen)}
        options={{ ...hiddenHeader }}
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
        <Stack.Screen
          name={ITW_ROUTES.PLAYGROUNDS.DISCOVERY_INFO_NEW}
          component={ItwDiscoveryInfoComponent}
        />
      </Stack.Group>
      <Stack.Screen name={ITW_ROUTES.SETTINGS} component={ItwSettingsScreen} />
    </Stack.Navigator>
  );
});

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
