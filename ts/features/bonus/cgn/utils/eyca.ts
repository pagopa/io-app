import {
  EycaDetailsState,
  EycaDetailStatus
} from "../store/reducers/eyca/details";
import { isLoading, isReady } from "../../../../common/model/RemoteValue";

// return true if the EYCA details component can be shown
export const canEycaCardBeShown = (card: EycaDetailsState): boolean => {
  if (isLoading(card)) {
    return true;
  }
  const evaluateReady = (status: EycaDetailStatus): boolean => {
    switch (status) {
      case "FOUND":
      case "NOT_FOUND":
      case "ERROR":
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
