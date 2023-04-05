import { useFocusEffect } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useContext } from "react";
import RemindEmailValidationOverlay from "../components/RemindEmailValidationOverlay";
import { LightModalContext } from "../components/ui/LightModal";
import { useIOSelector } from "../store/hooks";
import { emailValidationSelector } from "../store/reducers/emailValidation";
import { isProfileEmailValidatedSelector } from "../store/reducers/profile";

export const useValidatedEmailModal = (isOnboarding?: boolean) => {
  const { showModal, hideModal } = useContext(LightModalContext);
  const isEmailValidatedSelector = useIOSelector(
    isProfileEmailValidatedSelector
  );
  const { acknowledgeOnEmailValidated } = useIOSelector(
    emailValidationSelector
  );

  const isEmailValidated = React.useMemo(
    () =>
      isEmailValidatedSelector &&
      pipe(
        acknowledgeOnEmailValidated,
        O.getOrElse(() => true)
      ),
    [isEmailValidatedSelector, acknowledgeOnEmailValidated]
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!isEmailValidated) {
        showModal(<RemindEmailValidationOverlay isOnboarding={isOnboarding} />);
      }

      return () => hideModal();
    }, [hideModal, isOnboarding, showModal, isEmailValidated])
  );
};
