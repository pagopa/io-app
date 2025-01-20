import { useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import I18n from "i18n-js";
import { itwReviewRequestedSelector } from "../store/selectors/preferences";
import { itwReviewRequested } from "../store/actions/preferences";
import { requestAppReview } from "../../../../utils/storeReview";
import { openWebUrl } from "../../../../utils/url";

/**
 * Hook to monitor reviewRequested state and display an alert if needed.
 * If reviewRequested is true, show an alert with two options: one to leave a review on the store and the other to fill out a form on Qualtrics.
 */
export const useItwReviewRequest = () => {
  const reviewRequested = useSelector(itwReviewRequestedSelector);
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      if (reviewRequested) {
        Alert.alert(
          I18n.t("features.itWallet.reviewRequested.alert.title"),
          I18n.t("features.itWallet.reviewRequested.alert.content"),
          [
            {
              text: I18n.t(
                "features.itWallet.reviewRequested.alert.cancelButton"
              ),
              onPress: () => openWebUrl("https://google.com")
            },
            {
              text: I18n.t(
                "features.itWallet.reviewRequested.alert.confirmButton"
              ),
              onPress: () => requestAppReview()
            }
          ]
        );
        dispatch(itwReviewRequested(false));
      }
    }, [reviewRequested, dispatch])
  );
};
