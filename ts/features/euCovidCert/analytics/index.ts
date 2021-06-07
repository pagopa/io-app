import { Action } from "redux";
import { getType } from "typesafe-actions";
import { mixpanel } from "../../../mixpanel";
import { euCovidCertificateGet } from "../store/actions";

export const trackEuCovidCertificateActions = (
  mp: NonNullable<typeof mixpanel>
) => (action: Action): Promise<void> => {
  switch (action.type) {
    case getType(euCovidCertificateGet.request):
      return mp.track(action.type);
    case getType(euCovidCertificateGet.success):
      return mp.track(action.type);
  }
  return Promise.resolve();
};
