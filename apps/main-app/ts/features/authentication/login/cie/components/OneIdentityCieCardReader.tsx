import { useCallback } from "react";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { trackLoginCieCardReaderScreen } from "../../../common/analytics/cieAnalytics";
import { LoginType } from "../../../common/utils/index";
import { useCieManager } from "../hooks/useCieManager";
import { OneIdentityCieCardReaderFailure } from "./OneIdentityCieCardReaderFailure";
import { OneIdentityCieCardReaderProgress } from "./OneIdentityCieCardReaderProgress";

type OneIdentityCieCardReaderProps = {
  authenticationUrl: string;
  flow: LoginType;
  onAuthorizationUrlReceived: (authorizationUrl: string) => void;
  pin: string;
};

export const OneIdentityCieCardReader = ({
  flow,
  onAuthorizationUrlReceived,
  pin,
  authenticationUrl
}: OneIdentityCieCardReaderProps) => {
  const navigation = useIONavigation();

  const { startReading, state } = useCieManager({
    onSuccess: onAuthorizationUrlReceived
  });

  const handleCancel = useCallback(() => navigation.goBack(), [navigation]);

  const handleRetry = useCallback(
    () => void startReading(pin, authenticationUrl),
    [startReading, pin, authenticationUrl]
  );

  useOnFirstRender(() => {
    void trackLoginCieCardReaderScreen(flow);
    void startReading(pin, authenticationUrl);
  });

  if (state.status === "failure") {
    return <OneIdentityCieCardReaderFailure failure={state.failure} />;
  }

  return (
    <OneIdentityCieCardReaderProgress
      onCancel={handleCancel}
      onRetry={handleRetry}
      state={state}
    />
  );
};
