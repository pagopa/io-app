import { FeatureInfo, IOButton, VStack } from "@pagopa/io-app-design-system";
import { constUndefined } from "fp-ts/lib/function";
import i18n from "i18next";
import { useRef } from "react";
import { useIODispatch } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { identificationRequest } from "../../../identification/store/actions";
import {
  trackSendAarNotificationOpeningMandateBottomSheetAccepted,
  trackSendAarNotificationOpeningMandateBottomSheetClosure
} from "../analytics";

type BsFooterButtonProps = {
  onIdentificationSuccess?: () => void;
  onIdentificationCancel?: () => void;
  onContinuePress?: () => void;
};
const BsFooterButton = ({
  onIdentificationCancel = constUndefined,
  onIdentificationSuccess = constUndefined,
  onContinuePress
}: BsFooterButtonProps) => {
  const dispatch = useIODispatch();

  const handlePress = () => {
    onContinuePress?.();
    trackSendAarNotificationOpeningMandateBottomSheetAccepted();

    dispatch(
      identificationRequest(
        true,
        false,
        undefined,
        {
          label: i18n.t("global.buttons.cancel"),
          onCancel: onIdentificationCancel
        },
        {
          onSuccess: onIdentificationSuccess
        }
      )
    );
  };

  return (
    <IOButton
      testID="requestIdentification"
      fullWidth
      variant="solid"
      label={i18n.t("global.buttons.continue")}
      onPress={handlePress}
    />
  );
};
type SendAarDelegationProposalBsProps = {
  citizenName: string;
} & BsFooterButtonProps;

export const useSendAarDelegationProposalScreenBottomSheet = ({
  citizenName,
  onIdentificationSuccess,
  onIdentificationCancel
}: SendAarDelegationProposalBsProps) => {
  const ctaPressed = useRef(false);

  const featureInfoText = i18n.t(
    "features.pn.aar.flow.delegated.notAdressee.bottomSheet.featureInfos",
    { returnObjects: true, name: citizenName }
  );

  const Body = () => (
    <VStack space={24}>
      <FeatureInfo
        pictogramProps={{
          name: "cie"
        }}
        body={featureInfoText[0]}
      />
      <FeatureInfo
        pictogramProps={{
          name: "pinSecurity"
        }}
        body={featureInfoText[1]}
      />
      <BsFooterButton
        onIdentificationSuccess={onIdentificationSuccess}
        onIdentificationCancel={() => {
          // eslint-disable-next-line functional/immutable-data
          ctaPressed.current = false;
          onIdentificationCancel?.();
        }}
        onContinuePress={() => {
          // eslint-disable-next-line functional/immutable-data
          ctaPressed.current = true;
        }}
      />
    </VStack>
  );

  return useIOBottomSheetModal({
    title: i18n.t(
      "features.pn.aar.flow.delegated.notAdressee.bottomSheet.title"
    ),
    component: <Body />,
    onDismiss: () => {
      /**
       * This is a workaround that allows us to track the bottom-sheet close event only when
       * the closing action is direct and not the result of another action
       */
      if (!ctaPressed.current) {
        trackSendAarNotificationOpeningMandateBottomSheetClosure();
      }
    }
  });
};
