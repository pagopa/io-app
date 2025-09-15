import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIODispatch } from "../../../../store/hooks";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../store/reducers";

export type SendAARLoadingScreenProps = {
  qrcode: string;
};

type RouteProps = RouteProp<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_LOADING_SCREEN
>;

export const SendAARLoadingScreen = () => {
  const route = useRoute<RouteProps>();
  const { qrcode } = route.params;
  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(
      setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode: qrcode
      })
    );
  }, [dispatch, qrcode]);

  return <LoadingScreenContent contentTitle="" />;
};
