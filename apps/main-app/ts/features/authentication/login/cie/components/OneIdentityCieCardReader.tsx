import { useCallback } from "react";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { cieLoginFlowSelector } from "../../../activeSessionLogin/store/selectors";
import { trackLoginCieCardReaderScreen } from "../../../common/analytics/cieAnalytics";
import { useCieManager } from "../hooks/useCieManager";
import { OneIdentityCieCardReaderFailure } from "./OneIdentityCieCardReaderFailure";
import { OneIdentityCieCardReaderProgress } from "./OneIdentityCieCardReaderProgress";

type OneIdentityCieCardReaderProps = {
  authenticationUrl: string;
  onAuthorizationUrlReceived: (authorizationUrl: string) => void;
  pin: string;
};

export const OneIdentityCieCardReader = ({
  onAuthorizationUrlReceived,
  pin,
  authenticationUrl
}: OneIdentityCieCardReaderProps) => {
  const navigation = useIONavigation();
  const store = useIOStore();
  const loginFlow = cieLoginFlowSelector(store.getState());

  const { startReading, state } = useCieManager({
    onSuccess: onAuthorizationUrlReceived
  });

  const handleCancel = useCallback(() => navigation.goBack(), [navigation]);

  const handleRetry = useCallback(
    () => void startReading(pin, authenticationUrl),
    [startReading, pin, authenticationUrl]
  );

  useOnFirstRender(() => {
    void trackLoginCieCardReaderScreen(loginFlow);
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
