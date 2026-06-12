import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { itwIsPendingReviewSelector } from "../store/selectors/preferences";
import { itwSetReviewPending } from "../store/actions/preferences";
import { useAppFeedbackContext } from "../../../appReviews/components/AppFeedbackProvider";

/**
 * Hook to monitor isPendingReview state and request an app review if needed.
 * If isPendingReview is true, request an app review and then set isPendingReview to false.
 */
export const useItwPendingReviewRequest = () => {
  const { requestFeedback } = useAppFeedbackContext();
  const isPendingReview = useSelector(itwIsPendingReviewSelector);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isPendingReview && isFocused) {
      requestFeedback("itw");
      dispatch(itwSetReviewPending(false));
    }
  }, [isPendingReview, dispatch, isFocused, requestFeedback]);
};
