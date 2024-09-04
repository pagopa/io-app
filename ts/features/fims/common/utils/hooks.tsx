import * as React from "react";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { serviceByIdPotSelector } from "../../../services/details/store/reducers";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { isStrictNone } from "../../../../utils/pot";

export const useAutoFetchingServiceByIdPot = (serviceId: ServiceId) => {
  const dispatch = useIODispatch();
  const serviceData = useIOSelector(state =>
    serviceByIdPotSelector(state, serviceId)
  );
  const shouldFetchServiceData = isStrictNone(serviceData);

  React.useEffect(() => {
    if (shouldFetchServiceData) {
      dispatch(loadServiceDetail.request(serviceId));
    }
  }, [dispatch, serviceId, shouldFetchServiceData]);

  return { serviceData };
};
