import { useEffect } from "react";
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

  useEffect(() => {
    const shouldFetchServiceData =
      isStrictNone(serviceData) || serviceData.kind === "PotNoneError";

    if (shouldFetchServiceData) {
      dispatch(loadServiceDetail.request(serviceId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, serviceId]);

  return serviceData;
};
