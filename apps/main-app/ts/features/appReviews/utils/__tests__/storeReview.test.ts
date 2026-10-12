import * as StoreReview from "expo-store-review";

import * as AppReviewAnalytics from "../../analytics";
import { requestAppReview } from "../storeReview";

describe("requestAppReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks an attempt when the review request succeeds", async () => {
    const requestReview = jest
      .spyOn(StoreReview, "requestReview")
      .mockResolvedValue(undefined);
    const trackAttempt = jest.spyOn(
      AppReviewAnalytics,
      "trackAppReviewRequestAttempt"
    );
    const trackFailure = jest.spyOn(
      AppReviewAnalytics,
      "trackAppReviewRequestFailure"
    );

    await requestAppReview();

    expect(trackAttempt).toHaveBeenCalledTimes(1);
    expect(requestReview).toHaveBeenCalledTimes(1);
    expect(trackFailure).not.toHaveBeenCalled();
  });

  it("tracks an attempt and failure when the review request rejects", async () => {
    jest
      .spyOn(StoreReview, "requestReview")
      .mockRejectedValue(new Error("Review request failed"));
    const trackAttempt = jest.spyOn(
      AppReviewAnalytics,
      "trackAppReviewRequestAttempt"
    );
    const trackFailure = jest.spyOn(
      AppReviewAnalytics,
      "trackAppReviewRequestFailure"
    );

    await expect(requestAppReview()).resolves.toBeUndefined();

    expect(trackAttempt).toHaveBeenCalledTimes(1);
    expect(trackFailure).toHaveBeenCalledTimes(1);
  });
});
