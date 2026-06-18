import { NativeModules } from "react-native";

export interface AppReviewModule {
  requestReview: () => void;
}

export default NativeModules.AppReviewModule as AppReviewModule;
