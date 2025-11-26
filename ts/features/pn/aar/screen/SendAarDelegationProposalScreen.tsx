import { useIOToast } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useCallback, useEffect } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { useIsNfcFeatureAvailable } from "../hooks/useIsNfcFeatureAvailable";
import { useSendAarDelegationProposalScreenBottomSheet } from "../hooks/useSendAarDelegationProposalScreenBottomSheet";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { setAarFlowState } from "../store/actions";
import {
  AARFlowState,
  SendAARFlowStatesType,
  sendAARFlowStates
} from "../utils/stateUtils";

export type SendAarDelegationProposalNavigationParams = Readonly<
  Exclude<
    Extract<AARFlowState, { type: SendAARFlowStatesType["notAddressee"] }>,
    "type"
  >
>;
type SendAarDelegationProposalScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL
>;

export const SendAarDelegationProposalScreen = ({
  route
}: SendAarDelegationProposalScreenProps) => {
  const navigation = useIONavigation();
  const isNfcAvailable = useIsNfcFeatureAvailable();
  const dispatch = useIODispatch();

  const { terminateFlow, currentFlowData } = useSendAarFlowManager();
  const { type } = currentFlowData;
  const { warning } = useIOToast();
  const { params } = route;
  const { denomination } = params.recipientInfo;

  const { bottomSheet, present } =
    useSendAarDelegationProposalScreenBottomSheet(denomination);

  useOnFirstRender(() => {
    warning(i18n.t("features.pn.aar.flow.delegated.notAdressee.warningAlert"));
  });

  const handleContinuePress = useCallback(() => {
    if (isNfcAvailable) {
      present();
    } else {
      dispatch(
        setAarFlowState({
          ...params,
          type: sendAARFlowStates.nfcNotSupportedFinal
        })
      );
    }
  }, [isNfcAvailable, present, dispatch, params]);

  useEffect(() => {
    if (type === sendAARFlowStates.nfcNotSupportedFinal) {
      navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.SEND_AAR_ERROR
        }
      });
    }
  }, [navigation, type]);

  return (
    <>
      <OperationResultScreenContent
        title={i18n.t("features.pn.aar.flow.delegated.notAdressee.title", {
          name: denomination
        })}
        subtitle={i18n.t("features.pn.aar.flow.delegated.notAdressee.subtitle")}
        pictogram="identityCheck"
        action={{
          label: i18n.t(
            "features.pn.aar.flow.delegated.notAdressee.primaryAction"
          ),
          onPress: handleContinuePress
        }}
        secondaryAction={{
          label: i18n.t("global.buttons.close"),
          onPress: terminateFlow
        }}
      />
      {bottomSheet}
    </>
  );
};
