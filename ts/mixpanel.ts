import { MixpanelInstance } from "react-native-mixpanel";

import { mixpanelToken } from "./config";

// tslint:disable-next-line:no-let
export let mixpanel: MixpanelInstance | undefined;

// Initialize mixpanel at start
const privateInstance = new MixpanelInstance(mixpanelToken);
privateInstance
  .initialize()
  .then(() => {
    // on initialization, set the share instance
    mixpanel = privateInstance;
  })
  .catch(() => 0);
