import { requireNativeModule } from "expo-modules-core";

interface ExpoAppReviewModule {
  requestReview: () => void;
}

const ExpoAppReview = requireNativeModule<ExpoAppReviewModule>("ExpoAppReview");

export const requestReview = (): void => ExpoAppReview.requestReview();
