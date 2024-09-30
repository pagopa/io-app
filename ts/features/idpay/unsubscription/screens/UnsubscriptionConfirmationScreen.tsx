import {
  ContentWrapper,
  FooterWithButtons,
  IconButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { useConfirmationChecks } from "../../../../hooks/useConfirmationChecks";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { UnsubscriptionCheckListItem } from "../components/UnsubscriptionCheckListItem";
import { IdPayUnsubscriptionParamsList } from "../navigation/params";
import { idPayUnsubscribeAction } from "../store/actions";
import {
  isFailureSelector,
  isLoadingSelector,
  isUnsubscriptionSuccessSelector
} from "../store/selectors";
import { IdPayUnsubscriptionRoutes } from "../navigation/routes";

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

const UnsubscriptionConfirmationScreen = () => {
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

  React.useEffect(() => {
    if (isFailure || isSuccess) {
      navigation.navigate(IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
        screen: IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT
      });
    }
  }, [navigation, isFailure, isSuccess]);

  const closeButton = (
    <IconButton
      icon="closeLarge"
      color="neutral"
      onPress={handleClosePress}
      accessibilityLabel={I18n.t("global.buttons.close")}
    />
  );

  const confirmModal = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("idpay.unsubscription.modal.title", { initiativeName }),
      component: (
        <View>
          <Body>{I18n.t("idpay.unsubscription.modal.content")}</Body>
          <VSpacer size={16} />
        </View>
      ),
      footer: (
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          primary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t("idpay.unsubscription.button.continue"),
              accessibilityLabel: I18n.t(
                "idpay.unsubscription.button.continue"
              ),
              onPress: () => {
                confirmModal.dismiss();
                handleConfirmPress();
              },
              color: "danger"
            }
          }}
          secondary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t("global.buttons.cancel"),
              accessibilityLabel: I18n.t("global.buttons.cancel"),
              onPress: () => {
                confirmModal.dismiss();
              }
            }
          }}
        />
      )
    },
    175
  );

  const body = (
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView>
        <ContentWrapper>
          <VSpacer size={16} />
          <H1>{I18n.t("idpay.unsubscription.title", { initiativeName })}</H1>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.unsubscription.subtitle")}</Body>
          <VSpacer size={16} />
          {unsubscriptionChecks.map((item, index) => (
            <UnsubscriptionCheckListItem
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              checked={checks.values[index]}
              onValueChange={value => checks.setValue(index, value)}
            />
          ))}
          <VSpacer size={48} />
        </ContentWrapper>
      </ScrollView>
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            onPress: handleClosePress
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            color: checks.areFulfilled ? "danger" : "primary",
            label: I18n.t("idpay.unsubscription.button.continue"),
            onPress: confirmModal.present,
            disabled: !checks.areFulfilled
          }
        }}
      />
    </SafeAreaView>
  );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("idpay.unsubscription.headerTitle")}
      customGoBack={closeButton}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        {!isLoading && body}
      </LoadingSpinnerOverlay>
      {confirmModal.bottomSheet}
    </BaseScreenComponent>
  );
};

export default UnsubscriptionConfirmationScreen;
