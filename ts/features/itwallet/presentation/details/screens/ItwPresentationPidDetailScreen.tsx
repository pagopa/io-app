import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { VSpacer } from "@pagopa/io-app-design-system";
import { ItwPresentationPidDetail } from "../components/ItwPresentationPidDetail";
import { useIOSelector } from "../../../../../store/hooks";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";
import { ItwPresentationPidScaffoldScreen } from "../components/ItwPresentationPidScaffoldScreen";

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useIOSelector(itwCredentialsEidSelector);

  return pipe(
    pidOption,
    O.fold(
      constNull, // This should never happen
      credential => (
        <ItwPresentationPidScaffoldScreen credential={credential}>
          <ItwPresentationPidDetail credential={credential} />
          <VSpacer />
          {/* TODO: add Footer with CTAs */}
        </ItwPresentationPidScaffoldScreen>
      )
    )
  );
};
