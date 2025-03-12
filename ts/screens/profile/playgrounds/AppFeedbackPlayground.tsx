import { Body, ButtonSolid, VSpacer } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { clearFeedbackDatas } from "../../../features/appReviews/store/actions";
import {
  appReviewNegativeFeedbackLogSelector,
  appReviewPositiveFeedbackLogSelector
} from "../../../features/appReviews/store/selectors";
import { useAppReviewRequest } from "../../../features/appReviews/hooks/useAppReviewRequest";

export const AppFeedbackPlayground = () => {
  const {
    requestFeedback: requestFeedbackItw,
    appReviewBottomSheet: itwFeedbackBottomSheet
  } = useAppReviewRequest("itw");
  const {
    requestFeedback: requestFeedbackPayment,
    appReviewBottomSheet: paymentsFeedbackBottomSheet
  } = useAppReviewRequest("payments");
  const {
    requestFeedback: requestFeedbackGeneral,
    appReviewBottomSheet: generalFeedbackBottomSheet
  } = useAppReviewRequest();
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
      <ButtonSolid
        color="danger"
        onPress={() => dispatch(clearFeedbackDatas())}
        label="Rimuovi log sui feedback"
      />
      <VSpacer />
      <ButtonSolid
        onPress={requestFeedbackPayment}
        label="Richiedi feedback pagamenti"
      />
      <VSpacer />
      <ButtonSolid onPress={requestFeedbackItw} label="Richiedi feedback ITW" />
      <VSpacer />
      <ButtonSolid
        onPress={requestFeedbackGeneral}
        label="Richiedi feedback generale"
      />
      {generalFeedbackBottomSheet}
      {itwFeedbackBottomSheet}
      {paymentsFeedbackBottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};
