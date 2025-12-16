import { useCallback, useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  preconditionsCategoryTagSelector,
  preconditionsRequireAppUpdateSelector,
  shouldPresentPreconditionsBottomSheetSelector
} from "../../store/reducers/messagePrecondition";
import {
  idlePreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toIdlePayload,
  toRetrievingDataPayload,
  toUpdateRequiredPayload,
  updateRequiredPreconditionStatusAction
} from "../../store/actions/preconditions";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { trackDisclaimerOpened } from "../../analytics";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PreconditionsTitle } from "./PreconditionsTitle";
import { PreconditionsContent } from "./PreconditionsContent";
import { PreconditionsFooter } from "./PreconditionsFooter";

export const Preconditions = () => {
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const store = useIOStore();
  const onDismissCallback = useCallback(() => {
    dispatch(idlePreconditionStatusAction(toIdlePayload()));
  }, [dispatch]);
  const onNavigationCallback = useCallback(
    (messageId: string) => {
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
        params: {
          messageId,
          fromNotification: false
        }
      });
    },
    [navigation]
  );
  const modal = useIOBottomSheetModal({
    snapPoint: [550],
    title: <PreconditionsTitle />,
    component: <PreconditionsContent footerHeight={footerHeight} />,
    footer: (
      <PreconditionsFooter
        onDismiss={() => modal.dismiss()}
        onNavigation={onNavigationCallback}
        onFooterHeightAvailable={setFooterHeight}
      />
    ),
    onDismiss: onDismissCallback
  });
  const shouldPresentBottomSheet = useIOSelector(
    shouldPresentPreconditionsBottomSheetSelector
  );

  useEffect(() => {
    if (shouldPresentBottomSheet) {
      const state = store.getState();
      const categoryTag = preconditionsCategoryTagSelector(state);
      if (categoryTag) {
        trackDisclaimerOpened(categoryTag);
      }
      // Preconditions shown while searching messages should dismiss the keyboard
      Keyboard.dismiss();
      modal.present();

      const requiresAppUpdate = preconditionsRequireAppUpdateSelector(state);
      if (requiresAppUpdate) {
        dispatch(
          updateRequiredPreconditionStatusAction(toUpdateRequiredPayload())
        );
      } else {
        dispatch(
          retrievingDataPreconditionStatusAction(toRetrievingDataPayload())
        );
      }
    }
  }, [dispatch, modal, shouldPresentBottomSheet, store]);
  return modal.bottomSheet;
};
