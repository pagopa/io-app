import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import * as React from "react";
import { Platform } from "react-native";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwActivateNfcScreen } from "../identification/screens/cie/ItwActivateNfcScreen";
import { ItwCieCardReaderScreen } from "../identification/screens/cie/ItwCieCardReaderScreen";
import { ItwCieExpiredOrInvalidScreen } from "../identification/screens/cie/ItwCieExpiredOrInvalidScreen";
import { ItwCiePinScreen } from "../identification/screens/cie/ItwCiePinScreen";
import { ItwCieUnexpectedErrorScreen } from "../identification/screens/cie/ItwCieUnexpectedErrorScreen";
import { ItwCieWrongCardScreen } from "../identification/screens/cie/ItwCieWrongCardScreen";
import { ItwCieWrongCiePinScreen } from "../identification/screens/cie/ItwCieWrongCiePinScreen";
import { ItwIdentificationIdpSelectionScreen } from "../identification/screens/ItwIdentificationIdpSelectionScreen";
import { ItwIdentificationModeSelectionScreen } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwIssuanceCredentialFailureScreen } from "../issuance/screens/ItwIssuanceCredentialFailureScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../issuance/screens/ItwIssuanceCredentialTrustIssuerScreen";
import { ItwIssuanceEidFailureScreen } from "../issuance/screens/ItwIssuanceEidFailureScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import { ItwIdentityNotMatchingScreen } from "../lifecycle/screens/ItwIdentityNotMatchingScreen";
import { ItwLifecycleWalletRevocationScreen } from "../lifecycle/screens/ItwLifecycleWalletRevocationScreen";
import {
  ItWalletIssuanceMachineProvider,
  ItwCredentialIssuanceMachineContext,
  ItwEidIssuanceMachineContext
} from "../machine/provider";
import { WalletCardOnboardingScreen } from "../onboarding/screens/WalletCardOnboardingScreen";
import ItwPlayground from "../playgrounds/screens/ItwPlayground";
import { ItwPresentationCredentialAttachmentScreen } from "../presentation/screens/ItwPresentationCredentialAttachmentScreen";
import { ItwPresentationCredentialCardModal } from "../presentation/screens/ItwPresentationCredentialCardModal";
import { ItwPresentationCredentialDetailScreen } from "../presentation/screens/ItwPresentationCredentialDetailScreen";
import { ItwIssuanceCredentialAsyncContinuationScreen } from "../issuance/screens/ItwIssuanceCredentialAsyncContinuationScreen";
import ItwIpzsPrivacyScreen from "../discovery/screens/ItwIpzsPrivacyScreen";
import ItwSpidIdpLoginScreen from "../identification/screens/spid/ItwSpidIdpLoginScreen";
import ItwCieIdLoginScreen from "../identification/screens/cieId/ItwCieIdLoginScreen";
import { ItwPresentationCredentialFiscalCodeModal } from "../presentation/screens/ItwPresentationCredentialFiscalCodeModal";
import { ItwCredentialTrustmarkScreen } from "../trustmark/screens/ItwCredentialTrustmarkScreen";
import { ItwAlreadyActiveScreen } from "../discovery/screens/ItwAlreadyActiveScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./routes";
import { ItwPresentationEidVerificationExpiredScreen } from "../presentation/screens/ItwPresentationEidVerificationExpiredScreen";

const Stack = createStackNavigator<ItwParamsList>();

const hiddenHeader = { headerShown: false };

export const ItwStackNavigator = () => (
  <ItWalletIssuanceMachineProvider>
    <InnerNavigator />
  </ItWalletIssuanceMachineProvider>
);

const InnerNavigator = () => {
  const eidIssuanceMachineRef = ItwEidIssuanceMachineContext.useActorRef();
  const credentialIssuanceMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_ROUTES.DISCOVERY.INFO}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          eidIssuanceMachineRef.send({ type: "back" });
          credentialIssuanceMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_ROUTES.ONBOARDING}
        component={WalletCardOnboardingScreen}
      />
      {/* DISCOVERY */}
      <Stack.Screen
        name={ITW_ROUTES.DISCOVERY.INFO}
        component={ItwDiscoveryInfoScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.DISCOVERY.IPZS_PRIVACY}
        component={ItwIpzsPrivacyScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN}
        component={ItwAlreadyActiveScreen}
        options={hiddenHeader}
      />
      {/* IDENTIFICATION */}
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.MODE_SELECTION}
        component={ItwIdentificationModeSelectionScreen}
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
        name={ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN}
        component={ItwCiePinScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.CARD_READER_SCREEN}
        component={ItwCieCardReaderScreen}
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
        component={ItwIssuanceCredentialAsyncContinuationScreen}
        options={hiddenHeader}
      />
      {/* CREDENTIAL PRESENTATION */}
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL}
        component={ItwPresentationCredentialDetailScreen}
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
      {/* PLAYGROUNDS */}
      <Stack.Screen name={ITW_ROUTES.PLAYGROUNDS} component={ItwPlayground} />
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
      />
    </Stack.Navigator>
  );
};
