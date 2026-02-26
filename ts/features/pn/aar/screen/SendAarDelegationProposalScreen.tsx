import { useIOToast } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import i18n from "i18next";
import { useCallback, useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { useIsNfcFeatureAvailable } from "../hooks/useIsNfcFeatureAvailable";
import { useSendAarDelegationProposalScreenBottomSheet } from "../hooks/useSendAarDelegationProposalScreenBottomSheet";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { setAarFlowState } from "../store/actions";
import { AarStatesByName, sendAARFlowStates } from "../utils/stateUtils";
import {
  trackSendAarNotificationOpeningMandateBottomSheet,
  trackSendAarNotificationOpeningMandateDisclaimer,
  trackSendAarNotificationOpeningMandateDisclaimerAccepted,
  trackSendAarNotificationOpeningMandateDisclaimerClosure
} from "../analytics";

export const SendAarDelegationProposalScreen = () => {
  const { terminateFlow, currentFlowData } = useSendAarFlowManager();
  const { type } = currentFlowData;
  const navigation =
    useNavigation<
      StackNavigationProp<PnParamsList, "SEND_AAR_DELEGATION_PROPOSAL">
    >();
  const { info, hideAll } = useIOToast();

  useOnFirstRender(() => {
    info(i18n.t("features.pn.aar.flow.delegated.notAdressee.infoAlert"));
  });

  useEffect(() => {
    switch (type) {
      case sendAARFlowStates.ko:
      case sendAARFlowStates.nfcNotSupportedFinal: {
        hideAll();
        navigation.replace(PN_ROUTES.SEND_AAR_ERROR);
        break;
      }
      case sendAARFlowStates.cieCanAdvisory: {
        hideAll();
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL);
        break;
      }
    }
  }, [hideAll, navigation, type]);

  switch (type) {
    case sendAARFlowStates.notAddressee:
      return (
        <DelegationProposalContent
          terminateFlow={terminateFlow}
          notAdresseeData={currentFlowData}
        />
      );
    default:
      return (
        <LoadingScreenContent
          testID="delegationLoading"
          title={i18n.t(
            "features.pn.aar.flow.delegated.createMandate.loadingText"
          )}
          headerVisible={false}
        />
      );
  }
};

type DelegationProposalContentProps = {
  notAdresseeData: AarStatesByName["notAddressee"];
  terminateFlow: () => void;
};
const DelegationProposalContent = ({
  notAdresseeData,
  terminateFlow
}: DelegationProposalContentProps) => {
  const isNfcAvailable = useIsNfcFeatureAvailable();
  const dispatch = useIODispatch();

  const { denomination } = notAdresseeData.recipientInfo;

  useEffect(() => {
    trackSendAarNotificationOpeningMandateDisclaimer();
  }, []);

  const handleIdentificationSuccess = useCallback(() => {
    dispatch(
      setAarFlowState({
        type: sendAARFlowStates.creatingMandate,
        iun: notAdresseeData.iun,
        recipientInfo: notAdresseeData.recipientInfo,
        qrCode: notAdresseeData.qrCode
      })
    );
  }, [dispatch, notAdresseeData]);

  const { bottomSheet, present } =
    useSendAarDelegationProposalScreenBottomSheet({
      citizenName: denomination,
      onIdentificationSuccess: handleIdentificationSuccess
    });
  const handleContinuePress = useCallback(() => {
    trackSendAarNotificationOpeningMandateDisclaimerAccepted();

    if (isNfcAvailable) {
      trackSendAarNotificationOpeningMandateBottomSheet();
      present();
    } else {
      dispatch(
        setAarFlowState({
          ...notAdresseeData,
          type: sendAARFlowStates.nfcNotSupportedFinal
        })
      );
    }
  }, [isNfcAvailable, present, dispatch, notAdresseeData]);

  const handleClose = useCallback(() => {
    trackSendAarNotificationOpeningMandateDisclaimerClosure();
    terminateFlow();
  }, [terminateFlow]);

  return (
    <>
      <OperationResultScreenContent
        testID="delegationProposal"
        title={i18n.t("features.pn.aar.flow.delegated.notAdressee.title", {
          name: denomination
        })}
        subtitle={i18n.t("features.pn.aar.flow.delegated.notAdressee.subtitle")}
        pictogram="identityCheck"
        action={{
          label: i18n.t(
            "features.pn.aar.flow.delegated.notAdressee.primaryAction"
          ),
          onPress: handleContinuePress,
          testID: "continue-button"
        }}
        secondaryAction={{
          label: i18n.t("global.buttons.close"),
          onPress: handleClose,
          testID: "close-button"
        }}
      />
      {bottomSheet}
    </>
  );
};
