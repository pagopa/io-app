import {
  BlockButtonProps,
  ContentWrapper,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { StackActions } from "@react-navigation/native";
import * as React from "react";
import { Alert, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { LabelledItem } from "../../components/LabelledItem";
import { LoadingErrorComponent } from "../../components/LoadingErrorComponent";
import {
  RadioButtonList,
  RadioItem
} from "../../components/core/selection/RadioButtonList";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import { shufflePinPadOnPayment } from "../../config";
import { isCgnEnrolledSelector } from "../../features/bonus/cgn/store/reducers/details";
import I18n from "../../i18n";
import NavigationService from "../../navigation/NavigationService";
import { identificationRequest } from "../../store/actions/identification";
import { navigateToWalletHome } from "../../store/actions/navigation";
import {
  RemoveAccountMotivationEnum,
  RemoveAccountMotivationPayload,
  removeAccountMotivation
} from "../../store/actions/profile";
import { GlobalState } from "../../store/reducers/types";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import { withKeyboard } from "../../utils/keyboard";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const getMotivationItems = (): ReadonlyArray<
  RadioItem<RemoveAccountMotivationEnum>
> => [
  {
    body: I18n.t("profile.main.privacy.removeAccount.details.answer_1"),
    id: RemoveAccountMotivationEnum.NOT_UTILS
  },
  {
    body: I18n.t("profile.main.privacy.removeAccount.details.answer_2"),
    id: RemoveAccountMotivationEnum.NOT_SAFE
  },
  {
    body: I18n.t("profile.main.privacy.removeAccount.details.answer_3"),
    id: RemoveAccountMotivationEnum.NEVER_USED
  },
  {
    body: I18n.t("profile.main.privacy.removeAccount.details.answer_4"),
    id: RemoveAccountMotivationEnum.OTHERS
  }
];
/**
 * A screen that ask user the motivation of the account removal
 * Here user can ask to delete his account
 */
const RemoveAccountDetails: React.FunctionComponent<Props> = (props: Props) => {
  // Initially no motivation is selected
  const [selectedMotivation, setSelectedMotivation] =
    React.useState<RemoveAccountMotivationEnum>(
      RemoveAccountMotivationEnum.UNDEFINED
    );

  const [otherMotivation, setOtherMotivation] = React.useState<string>("");

  const handleContinuePress = () => {
    const hasActiveBonus = props.cgnActiveBonus;

    if (hasActiveBonus) {
      Alert.alert(
        I18n.t("profile.main.privacy.removeAccount.alert.activeBonusTitle"),
        I18n.t(
          "profile.main.privacy.removeAccount.alert.activeBonusDescription"
        ),
        [
          {
            text: I18n.t(
              "profile.main.privacy.removeAccount.alert.cta.manageBonus"
            ),
            style: "default",
            onPress: props.navigateToWalletHomeScreen
          },
          {
            text: I18n.t(
              "profile.main.privacy.removeAccount.alert.cta.continue"
            ),
            style: "cancel",
            onPress: () => {
              handleSendMotivation(selectedMotivation);
            }
          }
        ]
      );
    } else {
      handleSendMotivation(selectedMotivation);
    }
  };

  const handleSendMotivation = (
    selectedMotivation: RemoveAccountMotivationEnum
  ) => {
    switch (selectedMotivation) {
      case RemoveAccountMotivationEnum.OTHERS:
        // Only the "others" reason allow to insert a custom text
        props.requestIdentification({
          reason: selectedMotivation,
          userText: otherMotivation
        });
        break;
      default:
        props.requestIdentification({ reason: selectedMotivation });
    }
  };

  const continueButtonProps: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      color: "primary",
      label: I18n.t("profile.main.privacy.removeAccount.info.cta"),
      accessibilityLabel: I18n.t("profile.main.privacy.removeAccount.info.cta"),
      onPress: handleContinuePress
    }
  };

  const loadingCaption = I18n.t(
    "profile.main.privacy.removeAccount.success.title"
  );
  return (
    <RNavScreenWithLargeHeader
      title={I18n.t("profile.main.privacy.removeAccount.title")}
      description={I18n.t("profile.main.privacy.removeAccount.details.body")}
      fixedBottomSlot={withKeyboard(
        <FooterWithButtons
          type={"SingleButton"}
          primary={continueButtonProps}
        />,
        true
      )}
    >
      {props.isLoading || props.isError ? (
        <LoadingErrorComponent
          isLoading={props.isLoading}
          loadingCaption={loadingCaption}
          onRetry={() => {
            props.onIdentificationSuccess({
              reason: selectedMotivation,
              userText: otherMotivation
            });
          }}
        />
      ) : (
        <SafeAreaView style={IOStyles.flex}>
          <ContentWrapper>
            <RadioButtonList<RemoveAccountMotivationEnum>
              head={I18n.t(
                "profile.main.privacy.removeAccount.details.question"
              )}
              key="delete_reason"
              items={getMotivationItems()}
              selectedItem={selectedMotivation}
              onPress={setSelectedMotivation}
            />
            {selectedMotivation === RemoveAccountMotivationEnum.OTHERS && (
              <LabelledItem
                label={I18n.t(
                  "profile.main.privacy.removeAccount.details.labelOpenAnswer"
                )}
                inputProps={{
                  keyboardType: "default",
                  returnKeyType: "done",
                  autoFocus: true,
                  maxLength: 18,
                  onChangeText: setOtherMotivation
                }}
              />
            )}
          </ContentWrapper>
        </SafeAreaView>
      )}
    </RNavScreenWithLargeHeader>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  const onIdentificationSuccess = (
    motivationPayload: RemoveAccountMotivationPayload
  ) => dispatch(removeAccountMotivation(motivationPayload));

  return {
    onIdentificationSuccess,
    requestIdentification: (
      motivationPayload: RemoveAccountMotivationPayload
    ) =>
      dispatch(
        identificationRequest(
          false,
          true,
          {
            message: I18n.t("wallet.ConfirmPayment.identificationMessage")
          },
          {
            label: I18n.t("wallet.ConfirmPayment.cancelPayment"),
            onCancel: () => undefined
          },
          {
            onSuccess: () => onIdentificationSuccess(motivationPayload)
          },
          shufflePinPadOnPayment
        )
      ),
    navigateToWalletHomeScreen: () => {
      NavigationService.dispatchNavigationAction(StackActions.popToTop());
      navigateToWalletHome();
    }
  };
};

const mapStateToProps = (state: GlobalState) => {
  const cgnActiveBonus = isCgnEnrolledSelector(state);
  const userDataProcessing = userDataProcessingSelector(state);
  const isLoading =
    pot.isLoading(userDataProcessing.DELETE) ||
    pot.isUpdating(userDataProcessing.DELETE);
  const isError = pot.isError(userDataProcessing.DELETE);
  return {
    cgnActiveBonus,
    userDataProcessing,
    isLoading,
    isError
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemoveAccountDetails);
