import { useEffect } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwEngagementScreenContent } from "../components/ItwEngagementScreenContent";

export const ItwEngagementScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

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
      onActivate={() =>
        navigation.navigate(ITW_ROUTES.MAIN, {
          state: {
            routes: [
              {
                name: ITW_ROUTES.DISCOVERY.INFO,
                params: { level: "l3" }
              }
            ]
          }
        })
      }
      onDismiss={() => navigation.goBack()}
    />
  );
};
