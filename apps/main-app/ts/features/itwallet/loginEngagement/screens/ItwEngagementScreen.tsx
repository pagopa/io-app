import { useFocusEffect } from "@react-navigation/native";
import { useEffect } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";
import {
  trackItwActivationModalDialog,
  trackItwActivationModalDialogActivationStart,
  trackItwActivationModalDialogDismissed
} from "../../analytics";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwEngagementScreenContent } from "../components/ItwEngagementScreenContent";

export const ItwEngagementScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  useFocusEffect(trackItwActivationModalDialog);

  // Any dismissal (button, back, gesture) hands over to the security advice
  useEffect(
    () =>
      navigation.addListener("beforeRemove", ({ data }) => {
        if (data.action.type !== "NAVIGATE") {
          dispatch(setSecurityAdviceReadyToShow(true));
        }
      }),
    [navigation, dispatch]
  );

  return (
    <ItwEngagementScreenContent
      onActivate={() => {
        trackItwActivationModalDialogActivationStart();
        navigation.navigate(ITW_ROUTES.MAIN, {
          state: {
            routes: [
              {
                name: ITW_ROUTES.DISCOVERY.INFO,
                params: { level: "l3" }
              }
            ]
          }
        });
      }}
      onDismiss={() => {
        trackItwActivationModalDialogDismissed();
        navigation.goBack();
      }}
    />
  );
};
