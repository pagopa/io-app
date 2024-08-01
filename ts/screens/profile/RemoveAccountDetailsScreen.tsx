/* eslint-disable functional/immutable-data */
import {
  ButtonSolid,
  ContentWrapper,
  H6,
  IOVisualCostants,
  RadioGroup,
  RadioItem,
  TextInput,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { StackActions } from "@react-navigation/native";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  AccessibilityInfo,
  Alert,
  Keyboard,
  SafeAreaView,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { shufflePinPadOnPayment } from "../../config";
import { isCgnEnrolledSelector } from "../../features/bonus/cgn/store/reducers/details";
import I18n from "../../i18n";
import NavigationService from "../../navigation/NavigationService";
import { identificationRequest } from "../../store/actions/identification";
import {
  RemoveAccountMotivationEnum,
  removeAccountMotivation
} from "../../store/actions/profile";
import {
  isUserDataProcessingDeleteErrorSelector,
  isUserDataProcessingDeleteLoadingSelector
} from "../../store/reducers/userDataProcessing";
import { withKeyboard } from "../../utils/keyboard";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { resetDeleteUserDataProcessing } from "../../store/actions/userDataProcessing";

type FooterButtonProps = {
  isLoading: boolean;
  onPress: () => void;
};

const FooterButton = memo(({ isLoading, onPress }: FooterButtonProps) => {
  const { bottom } = useSafeAreaInsets();

  return withKeyboard(
    <View
      style={{
        marginBottom: bottom === 0 ? IOVisualCostants.appMarginDefault : bottom
      }}
    >
      <ContentWrapper>
        <VSpacer size={16} />
        <ButtonSolid
          fullWidth
          loading={isLoading}
          color="danger"
          label={I18n.t("profile.main.privacy.removeAccount.details.cta")}
          accessibilityLabel={I18n.t(
            "profile.main.privacy.removeAccount.details.cta"
          )}
          onPress={onPress}
        />
      </ContentWrapper>
    </View>,
    true
  );
});
/**
 * A screen that ask user the motivation of the account removal
 * Here user can ask to delete his account
 */
const RemoveAccountDetails = () => {
  const dispatch = useIODispatch();
  const { navigate } = useIONavigation();
  const toast = useIOToast();
  const timeoutRef = useRef<number>();

  const hasActiveBonus = useIOSelector(isCgnEnrolledSelector);
  const isLoading = useIOSelector(isUserDataProcessingDeleteLoadingSelector);
  const isError = useIOSelector(isUserDataProcessingDeleteErrorSelector);

  // Initially no motivation is selected
  const [selectedMotivation, setSelectedMotivation] =
    useState<RemoveAccountMotivationEnum>(
      RemoveAccountMotivationEnum.UNDEFINED
    );
  const [otherMotivation, setOtherMotivation] = useState<string>("");

  const isOtherMotivation =
    selectedMotivation === RemoveAccountMotivationEnum.OTHERS;

  useEffect(() => {
    if (isError) {
      timeoutRef.current = setTimeout(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions(
          I18n.t("wallet.errors.GENERIC_ERROR"),
          { queue: true }
        );
      }, 1000);
      toast.error(I18n.t("wallet.errors.GENERIC_ERROR"));
    }
  }, [dispatch, isError, toast]);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      if (isError) {
        dispatch(resetDeleteUserDataProcessing());
      }
      clearTimeout(timeoutRef.current);
    };
  }, [dispatch, isError]);

  const handleSendMotivation = useCallback(
    (
      selectedMotivation: RemoveAccountMotivationEnum,
      otherMotivation?: string
    ) => {
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
            onSuccess: () =>
              dispatch(
                removeAccountMotivation({
                  reason: selectedMotivation,
                  ...(selectedMotivation === RemoveAccountMotivationEnum.OTHERS
                    ? { userText: otherMotivation }
                    : {})
                })
              )
          },
          shufflePinPadOnPayment
        )
      );
    },
    [dispatch]
  );

  const handleSetSelectedMotivation = useCallback(
    (motivation: RemoveAccountMotivationEnum) => {
      setSelectedMotivation(prev =>
        prev === motivation ? RemoveAccountMotivationEnum.UNDEFINED : motivation
      );
    },
    []
  );

  const handleContinuePress = useCallback(() => {
    Keyboard.dismiss();

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
            onPress: () => {
              NavigationService.dispatchNavigationAction(
                StackActions.popToTop()
              );
              navigate(ROUTES.MAIN, {
                screen: ROUTES.WALLET_HOME,
                params: { newMethodAdded: false }
              });
            }
          },
          {
            text: I18n.t(
              "profile.main.privacy.removeAccount.alert.cta.continue"
            ),
            style: "cancel",
            onPress: () => {
              handleSendMotivation(selectedMotivation, otherMotivation);
            }
          }
        ]
      );
    } else {
      handleSendMotivation(selectedMotivation, otherMotivation);
    }
  }, [
    hasActiveBonus,
    handleSendMotivation,
    otherMotivation,
    navigate,
    selectedMotivation
  ]);

  const otherMotivationInput = useMemo(() => {
    if (isOtherMotivation) {
      return (
        <>
          <VSpacer />
          <TextInput
            placeholder={I18n.t(
              "profile.main.privacy.removeAccount.details.labelOpenAnswer"
            )}
            accessibilityLabel={I18n.t(
              "profile.main.privacy.removeAccount.details.labelOpenAnswer"
            )}
            value={otherMotivation}
            onChangeText={setOtherMotivation}
            autoFocus
            textInputProps={{
              inputMode: "text",
              returnKeyType: "done",
              keyboardType: "default"
            }}
          />
        </>
      );
    }
    return null;
  }, [isOtherMotivation, otherMotivation]);

  const motivationItems: ReadonlyArray<RadioItem<RemoveAccountMotivationEnum>> =
    useMemo(
      () => [
        {
          value: I18n.t("profile.main.privacy.removeAccount.details.answer_1"),
          id: RemoveAccountMotivationEnum.NOT_UTILS
        },
        {
          value: I18n.t("profile.main.privacy.removeAccount.details.answer_2"),
          id: RemoveAccountMotivationEnum.NOT_SAFE
        },
        {
          value: I18n.t("profile.main.privacy.removeAccount.details.answer_3"),
          id: RemoveAccountMotivationEnum.NEVER_USED
        },
        {
          value: I18n.t("profile.main.privacy.removeAccount.details.answer_4"),
          id: RemoveAccountMotivationEnum.OTHERS
        }
      ],
      []
    );

  return (
    <>
      <IOScrollViewWithLargeHeader
        title={{
          label: I18n.t("profile.main.privacy.removeAccount.details.title")
        }}
        description={I18n.t("profile.main.privacy.removeAccount.details.body")}
      >
        <SafeAreaView style={IOStyles.flex}>
          <VSpacer />
          <ContentWrapper>
            <H6>
              {I18n.t("profile.main.privacy.removeAccount.details.question")}
            </H6>
            <VSpacer />
            <RadioGroup<RemoveAccountMotivationEnum>
              type="radioListItem"
              onPress={handleSetSelectedMotivation}
              items={motivationItems}
              selectedItem={selectedMotivation}
            />
            {otherMotivationInput}
          </ContentWrapper>
        </SafeAreaView>
      </IOScrollViewWithLargeHeader>
      <FooterButton isLoading={isLoading} onPress={handleContinuePress} />
    </>
  );
};

export default RemoveAccountDetails;
