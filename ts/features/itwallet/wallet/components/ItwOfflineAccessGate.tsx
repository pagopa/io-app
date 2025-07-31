import { PropsWithChildren, useState } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwIsOfflineAccessLimitReached,
  itwShouldDisplayOfflineAccessLimitWarning
} from "../../common/store/selectors/securePreferences";

export const ItwOfflineAccessGate = ({ children }: PropsWithChildren) => {
  const [warningViewed, setWarningViewed] = useState(false);
  const isLimitReached = useIOSelector(itwIsOfflineAccessLimitReached);
  const shouldDisplayLimitWarning = useIOSelector(
    itwShouldDisplayOfflineAccessLimitWarning
  );

  if (shouldDisplayLimitWarning && !warningViewed) {
    return (
      <OperationResultScreenContent
        testID="itwOfflineAccessGateWarningTestID"
        pictogram="attention"
        title="Il tuo dispositivo è offline da un po’ di tempo"
        subtitle="Collegati a internet e ricarica l’app per continuare ad usare Documenti su IO e gli altri servizi al prossimo accesso in app"
        action={{
          testID: "itwOfflineAccessGateWarningActionTestID",
          label: "Ho capito",
          onPress: () => setWarningViewed(true)
        }}
      />
    );
  }

  if (isLimitReached) {
    return (
      <OperationResultScreenContent
        testID="itwOfflineAccessGateLimitReachedTestID"
        pictogram="accessDenied"
        title="Il tuo dispositivo è offline da troppo tempo"
        subtitle="Collegati a internet e ricarica l’app per continuare ad usare Documenti su IO e gli altri servizi in app."
      />
    );
  }

  return children;
};
