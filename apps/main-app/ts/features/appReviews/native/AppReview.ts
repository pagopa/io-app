import { NativeModules } from "react-native";

interface AppReviewModule {
  requestReview: () => void;
}

export default NativeModules.AppReviewModule as AppReviewModule;
