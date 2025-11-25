import {
  Body,
  FooterActionsInline,
  ListItemCheckbox,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useConfirmationChecks } from "../../../../hooks/useConfirmationChecks";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/help";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { IdPayUnsubscriptionParamsList } from "../navigation/params";
import { IdPayUnsubscriptionRoutes } from "../navigation/routes";
import { idPayUnsubscribeAction } from "../store/actions";
import {
  isFailureSelector,
  isLoadingSelector,
  isUnsubscriptionSuccessSelector
} from "../store/selectors";

export type IdPayUnsubscriptionConfirmationScreenParams = {
  initiativeId: string;
  initiativeName: string;
  initiativeType: InitiativeRewardTypeEnum;
};

type RouteProps = RouteProp<
  IdPayUnsubscriptionParamsList,
  "IDPAY_UNSUBSCRIPTION_CONFIRMATION"
>;

const checksByInitiativeType = {
  [InitiativeRewardTypeEnum.REFUND]: [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.2.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.2.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.4.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.4.content")
    }
  ],

  [InitiativeRewardTypeEnum.EXPENSE]: [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.2.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.2.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.4.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.4.content")
    }
  ],

  [InitiativeRewardTypeEnum.DISCOUNT]: [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content")
    }
  ]
};

const IdPayUnsubscriptionConfirmationScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const { params } = useRoute<RouteProps>();
  const { initiativeId, initiativeName, initiativeType } = params;

  const isLoading = useIOSelector(isLoadingSelector);
  const isSuccess = useIOSelector(isUnsubscriptionSuccessSelector);
  const isFailure = useIOSelector(isFailureSelector);
  const unsubscriptionChecks = checksByInitiativeType[initiativeType];
  const checks = useConfirmationChecks(unsubscriptionChecks.length);

  const handleClosePress = () => {
    dispatch(idPayUnsubscribeAction.cancel());
    navigation.pop();
  };

  const handleConfirmPress = () => {
    dispatch(idPayUnsubscribeAction.request({ initiativeId }));
  };

  useEffect(() => {
    if (isFailure || isSuccess) {
      navigation.navigate(IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
        screen: IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT
      });
    }
  }, [navigation, isFailure, isSuccess]);

  const confirmModal = useIOBottomSheetModal({
    title: I18n.t("idpay.unsubscription.modal.title", { initiativeName }),
    component: (
      <View>
        <Body>{I18n.t("idpay.unsubscription.modal.content")}</Body>
        <VSpacer size={16} />
      </View>
    ),
    footer: (
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("global.buttons.cancel"),
          onPress: () => {
            confirmModal.dismiss();
          }
        }}
        endAction={{
          color: "danger",
          label: I18n.t("idpay.unsubscription.button.continue"),
          onPress: () => {
            confirmModal.dismiss();
            handleConfirmPress();
          }
        }}
      />
    )
  });

  const body = (
    <IOScrollViewWithLargeHeader
      goBack={handleClosePress}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{
        showHelp: true
      }}
      title={{
        label: I18n.t("idpay.unsubscription.title", { initiativeName })
      }}
      description={I18n.t("idpay.unsubscription.subtitle")}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("idpay.unsubscription.button.continue"),
          onPress: confirmModal.present,
          disabled: !checks.areFulfilled
        }
      }}
      includeContentMargins
    >
      {unsubscriptionChecks.map((item, index) => (
        <ListItemCheckbox
          key={index}
          value={item.title}
          description={item.subtitle}
          onValueChange={value => checks.setValue(index, value)}
        />
      ))}
    </IOScrollViewWithLargeHeader>
  );

  return (
    <>
      <LoadingSpinnerOverlay isLoading={isLoading}>
        {!isLoading && body}
      </LoadingSpinnerOverlay>
      {confirmModal.bottomSheet}
    </>
  );
};

export default IdPayUnsubscriptionConfirmationScreen;
