import { Body, IOButton, VSpacer } from "@pagopa/io-app-design-system";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useAppFeedbackContext } from "../../../appReviews/components/AppFeedbackProvider";
import { clearFeedbackDatas } from "../../../appReviews/store/actions";
import {
  appReviewNegativeFeedbackLogSelector,
  appReviewPositiveFeedbackLogSelector
} from "../../../appReviews/store/selectors";

export const AppFeedbackPlayground = () => {
  const { requestFeedback } = useAppFeedbackContext();
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
      includeContentMargins
      title={{ label: "App Feedback Playground" }}
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
        color="danger"
        label="Rimuovi log sui feedback"
        onPress={() => dispatch(clearFeedbackDatas())}
        variant="solid"
      />
      <VSpacer />
      <IOButton
        label="Richiedi feedback pagamenti"
        onPress={() => requestFeedback("payments")}
        variant="solid"
      />
      <VSpacer />
      <IOButton
        label="Richiedi feedback ITW"
        onPress={() => requestFeedback("itw")}
        variant="solid"
      />
      <VSpacer />
      <IOButton
        label="Richiedi feedback generale"
        onPress={() => requestFeedback("general")}
        variant="solid"
      />
    </IOScrollViewWithLargeHeader>
  );
};
