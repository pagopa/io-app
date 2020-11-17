import * as pot from "italia-ts-commons/lib/pot";

// A react component is the root node of a component tree. Each component of
// the tree can alter the store by dispatching actions which are managed by
// certain reducers. The union of states needed by each reducer plus the state
// directly mapped in props is the portion of state seen by a root component,
// so it must be initialized.

// Each reducer file contains also an init state, but it isn't exported :-(
export const initState = {
  network: { isConnected: true, actionQueue: [], isQueuePaused: false },
  content: {
    servicesMetadata: {
      byId: {}
    },
    municipality: {
      codiceCatastale: pot.none,
      data: pot.none
    },
    servicesByScope: pot.none,
    contextualHelp: pot.none
  },
  instabug: { unreadMessages: 0 },
  search: {
    searchText: null,
    isSearchEnabled: false,
    isSearchMessagesEnabled: false,
    isSearchServicesEnabled: false
  },
  persistedPreferences: {
    wasServiceAlertDisplayedOnce: false,
    isPagoPATestEnabled: false,
    isExperimentalFeaturesEnabled: false,
    isCustomEmailChannelEnabled: { kind: "PotSome", value: false },
    continueWithRootOrJailbreak: false,
    preferredLanguage: "it",
    isFingerprintEnabled: false
  }
};
