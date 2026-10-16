import { isLoading, isReady } from "../../../../common/model/RemoteValue";
import {
  EycaDetailsState,
  EycaDetailStatus
} from "../store/reducers/eyca/details";

// return true if the EYCA details component can be shown
export const canEycaCardBeShown = (card: EycaDetailsState): boolean => {
  if (isLoading(card)) {
    return true;
  }
  const evaluateReady = (status: EycaDetailStatus): boolean => {
    switch (status) {
      case "ERROR":
      case "FOUND":
      case "NOT_FOUND":
        return true;
      case "INELIGIBLE":
        return false;
    }
  };
  if (isReady(card)) {
    return evaluateReady(card.value.status);
  }
  return false;
};
