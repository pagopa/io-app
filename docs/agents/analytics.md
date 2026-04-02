## Analytics instructions

Use Mixpanel for event tracking. Each feature's `analytics/` folder exports typed track functions:

```ts
import { buildEventProperties } from "../../utils/analytics";
import { mixpanelTrack } from "../../mixpanel";

export const trackMyFeatureEvent = (payload: MyEventPayload) =>
  mixpanelTrack("MY_FEATURE_EVENT", buildEventProperties("UX", "action", payload));
```

- Always call analytics functions inside sagas or XState actions — never directly in components.
- Analytics must respect user consent; check Mixpanel opt-in state before tracking.