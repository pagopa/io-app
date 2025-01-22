import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { itwReviewRequestedSelector } from "../store/selectors/preferences";
import { itwReviewRequested } from "../store/actions/preferences";
import { requestAppReview } from "../../../../utils/storeReview";

/**
 * Hook to monitor reviewRequested state and request an app review if needed.
 * If reviewRequested is true, request an app review and then set reviewRequested to false.
 */
export const useItwReviewRequest = () => {
  const reviewRequested = useSelector(itwReviewRequestedSelector);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (reviewRequested && isFocused) {
      requestAppReview();
      dispatch(itwReviewRequested(false));
    }
  }, [reviewRequested, dispatch, isFocused]);
};
