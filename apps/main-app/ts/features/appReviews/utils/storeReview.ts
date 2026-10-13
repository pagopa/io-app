import * as StoreReview from "expo-store-review";

import {
  trackAppReviewRequestAttempt,
  trackAppReviewRequestFailure
} from "../analytics";

export const requestAppReview = async () => {
  trackAppReviewRequestAttempt();

  try {
    await StoreReview.requestReview();
  } catch {
    trackAppReviewRequestFailure();
  }
};
