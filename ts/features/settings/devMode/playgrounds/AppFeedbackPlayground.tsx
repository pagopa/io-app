import { Body, IOButton, VSpacer } from "@pagopa/io-app-design-system";
import { useContext } from "react";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { clearFeedbackDatas } from "../../../appReviews/store/actions";
import {
  appReviewNegativeFeedbackLogSelector,
  appReviewPositiveFeedbackLogSelector
} from "../../../appReviews/store/selectors";
import { useAppReviewRequest } from "../../../appReviews/hooks/useAppReviewRequest";
import { AppFeedbackContext } from "../../../appReviews/components/AppFeedbackProvider";

export const AppFeedbackPlayground = () => {
  const { requestFeedback } = useContext(AppFeedbackContext);
  // const {
  //   requestFeedback: requestFeedbackItw,
  //   appReviewBottomSheet: itwFeedbackBottomSheet
  // } = useAppReviewRequest("itw");
  // const {
  //   requestFeedback: requestFeedbackPayment,
  //   appReviewBottomSheet: paymentsFeedbackBottomSheet
  // } = useAppReviewRequest("payments");
  // const {
  //   requestFeedback: requestFeedbackGeneral,
  //   appReviewBottomSheet: generalFeedbackBottomSheet
  // } = useAppReviewRequest();
  const dispatch = useIODispatch();
  const appReviewPositiveFeedbackLog = useIOSelector(
    appReviewPositiveFeedbackLogSelector
  );
  const appReviewNegativeFeedbackLogPayments = useIOSelector(
    appReviewNegativeFeedbackLogSelector("payments")
  );
  const appReviewNegativeFeedbackLogItw = useIOSelector(
    appReviewNegativeFeedbackLogSelector("itw")
  );
  const appReviewNegativeFeedbackLogGeneral = useIOSelector(
    appReviewNegativeFeedbackLogSelector("general")
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: "App Feedback Playground" }}
      includeContentMargins
    >
      <Body>{`Ultimo feedback positivo: ${appReviewPositiveFeedbackLog}`}</Body>
      <VSpacer />
      <Body>{`Ultimo feedback negativo (pagamenti): ${appReviewNegativeFeedbackLogPayments}`}</Body>
      <VSpacer />
      <Body>{`Ultimo feedback positivo (itw): ${appReviewNegativeFeedbackLogItw}`}</Body>
      <VSpacer />
      <Body>{`Ultimo feedback positivo (generale): ${appReviewNegativeFeedbackLogGeneral}`}</Body>
      <VSpacer />
      <IOButton
        variant="solid"
        color="danger"
        onPress={() => dispatch(clearFeedbackDatas())}
        label="Rimuovi log sui feedback"
      />
      <VSpacer />
      <IOButton
        variant="solid"
        onPress={() => requestFeedback("payments")}
        label="Richiedi feedback pagamenti"
      />
      <VSpacer />
      <IOButton
        variant="solid"
        onPress={() => requestFeedback("itw")}
        label="Richiedi feedback ITW"
      />
      <VSpacer />
      <IOButton
        variant="solid"
        onPress={() => requestFeedback("general")}
        label="Richiedi feedback generale"
      />
    </IOScrollViewWithLargeHeader>
  );
};
