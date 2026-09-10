import { ActionArgs, assign } from "xstate";

import { assert } from "../../../../../utils/assert";
import {
  trackItwProximityQrCodeLoadingFailure,
  trackItwProximityStart
} from "../analytics";
import { ITW_PROXIMITY_ROUTES } from "../navigation/routes";
import { itwGrantProximityConsent } from "../store/actions";
import { itwPresentableCredentialsByDocTypeSelector } from "../store/selectors/credentials";
import {
  generateConsentKey,
  getConsentDataFromProximityDetails
} from "../store/utils";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";

/**
 * Initializes the proximity machine from the Redux store.
 */
export const onInitAction = assign<
  Context,
  ProximityEvents,
  unknown,
  ProximityEvents,
  any
>(({ context }) => {
  const { store } = context.deps;
  return {
    credentials: itwPresentableCredentialsByDocTypeSelector(store.getState())
  };
});

export const navigateToBluetoothPermissionsScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS
  });
};

export const navigateToBluetoothActivationScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION
  });
};

export const navigateToNfcActivationScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.NFC_ACTIVATION
  });
};

export const navigateToNfcPresentmentScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT
  });
};

export const navigateToPresentmentScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.PRESENTMENT,
    params: {}
  });
};

export const navigateToClaimsDisclosureScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE
  });
};

export const navigateToStoreconsentScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.STORE_CONSENT
  });
};

export const navigateToSuccessScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.SUCCESS
  });
};

export const navigateToFailureScreenAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
    screen: ITW_PROXIMITY_ROUTES.FAILURE
  });
};

export const closeProximityAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  context.deps.navigation.pop();
};

export const grantConsentAction = assign<
  Context,
  ProximityEvents,
  unknown,
  ProximityEvents,
  any
>(({ context }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  assert(
    context.proximityDetails,
    "ProximityDetails must be present in context to grant consent"
  );

  const consentData = getConsentDataFromProximityDetails(
    context.proximityDetails
  );

  return { grantedConsentKey: generateConsentKey(consentData) };
});

export const storeConsentAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  assert(
    context.proximityDetails,
    "ProximityDetails must be present in context to store consent"
  );

  const consentData = getConsentDataFromProximityDetails(
    context.proximityDetails
  );

  context.deps.store.dispatch(itwGrantProximityConsent(consentData));
};

export const trackProximityStartAction = ({
  context
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  trackItwProximityStart({
    proximity_flow: context.engagementMode === "nfc" ? "nfc" : "qr_code"
  });
};

export const trackQrCodeLoadingFailureAction = ({
  context,
  event
}: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
  if (context.engagementMode === "qrcode") {
    const { reason, type } = mapEventToFailure(event);
    trackItwProximityQrCodeLoadingFailure({ reason, type });
  }
};
