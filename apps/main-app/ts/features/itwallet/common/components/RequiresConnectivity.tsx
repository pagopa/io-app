import { useRoute } from "@react-navigation/native";
import { ReactNode, useEffect } from "react";

import { OfflineFailureComponent } from "../../../../components/error/OfflineFailure";
import { useIOSelector } from "../../../../store/hooks";
import { trackContentNotAvailable } from "../../../../utils/analytics";
import { isConnectedSelector } from "../../../connectivity/store/selectors";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";

type RequiresConnectivityProps = {
  children: ReactNode;
  failureComponent?: ReactNode;
};

/**
 * Replaces children with a failure component when connectivity is unavailable
 * or offline access is explicitly denied.
 */
export const RequiresConnectivity = ({
  children,
  failureComponent
}: RequiresConnectivityProps) => {
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const isConnected = useIOSelector(isConnectedSelector);
  const { name } = useRoute();

  const isOffline = !!offlineAccessReason || !isConnected;

  useEffect(() => {
    if (isOffline) {
      trackContentNotAvailable(name);
    }
  }, [name, isOffline]);

  if (isOffline) {
    return failureComponent ?? <OfflineFailureComponent isHeaderVisible />;
  }

  return <>{children}</>;
};
