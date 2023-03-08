import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useContext } from "react";
import RemindEmailValidationOverlay from "../components/RemindEmailValidationOverlay";
import { LightModalContext } from "../components/ui/LightModal";

export const useValidatedEmailModal = (isOnboarding?: boolean) => {
  const { showModal, hideModal } = useContext(LightModalContext);

  useFocusEffect(
    React.useCallback(() => {
      showModal(<RemindEmailValidationOverlay isOnboarding={isOnboarding} />);
      return () => hideModal();
    }, [hideModal, isOnboarding, showModal])
  );
};
