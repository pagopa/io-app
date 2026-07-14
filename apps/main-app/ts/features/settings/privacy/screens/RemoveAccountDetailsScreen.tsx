/* eslint-disable functional/immutable-data */
import {
  ContentWrapper,
  H6,
  IOButton,
  IOVisualCostants,
  RadioGroup,
  RadioItem,
  TextInput,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import { StackActions } from "@react-navigation/native";
import I18n from "i18next";
import {
  ComponentRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { AccessibilityInfo, Alert, Keyboard, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { shufflePinPadOnPayment } from "../../../../config";
import NavigationService from "../../../../navigation/NavigationService";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { withKeyboard } from "../../../../utils/keyboard";
import { isCgnEnrolledSelector } from "../../../bonus/cgn/store/reducers/details";
import { identificationRequest } from "../../../identification/store/actions";
import { useInputFocus } from "../../../payments/checkout/hooks/useInputFocus";
import {
  removeAccountMotivation,
  RemoveAccountMotivationEnum
} from "../../common/store/actions";
import { resetDeleteUserDataProcessing } from "../../common/store/actions/userDataProcessing";
import {
  isUserDataProcessingDeleteErrorSelector,
  isUserDataProcessingDeleteLoadingSelector
} from "../../common/store/selectors/userDataProcessing";

type FooterButtonProps = {
  buttonRef?: React.RefObject<View>;
  isLoading: boolean;
  onPress: () => void;
};

const FooterButton = memo(
  ({ isLoading, onPress, buttonRef }: FooterButtonProps) => {
    const { bottom } = useSafeAreaInsets();

    return withKeyboard(
      <View
        ref={buttonRef}
        style={{
          marginBottom:
            bottom === 0 ? IOVisualCostants.appMarginDefault : bottom
        }}
      >
        <ContentWrapper>
          <VSpacer size={16} />
          <IOButton
            color="danger"
            fullWidth
            label={I18n.t("profile.main.privacy.removeAccount.details.cta")}
            loading={isLoading}
            onPress={onPress}
            testID="remove-account-button"
            variant="solid"
          />
        </ContentWrapper>
      </View>,
      true
    );
  }
);
/**
 * A screen that ask user the motivation of the account removal
 * Here user can ask to delete his account
 */
const RemoveAccountDetails = () => {
  const dispatch = useIODispatch();
  const { navigate } = useIONavigation();
  const toast = useIOToast();
  const timeoutRef = useRef<number>(undefined);
  const buttonRef = useRef<View>(null);

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
      selectedMotivationProp: RemoveAccountMotivationEnum,
      otherMotivationProp?: string
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
                  reason: selectedMotivationProp,
                  ...(selectedMotivationProp ===
                  RemoveAccountMotivationEnum.OTHERS
                    ? { userText: otherMotivationProp }
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

  const textInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  useInputFocus(textInputRef);

  const otherMotivationInput = useMemo(() => {
    if (isOtherMotivation) {
      return (
        <>
          <VSpacer />
          <TextInput
            accessibilityLabel={I18n.t(
              "profile.main.privacy.removeAccount.details.labelOpenAnswer"
            )}
            inputRef={textInputRef}
            onBlur={() => setAccessibilityFocus(buttonRef)}
            onChangeText={setOtherMotivation}
            placeholder={I18n.t(
              "profile.main.privacy.removeAccount.details.labelOpenAnswer"
            )}
            textInputProps={{
              inputMode: "text",
              returnKeyType: "done",
              keyboardType: "default"
            }}
            value={otherMotivation}
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
        description={I18n.t("profile.main.privacy.removeAccount.details.body")}
        ignoreAccessibilityCheck
        title={{
          label: I18n.t("profile.main.privacy.removeAccount.details.title")
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <VSpacer />
          <ContentWrapper>
            <H6>
              {I18n.t("profile.main.privacy.removeAccount.details.question")}
            </H6>
            <VSpacer />
            <RadioGroup<RemoveAccountMotivationEnum>
              items={motivationItems}
              onPress={handleSetSelectedMotivation}
              selectedItem={selectedMotivation}
              type="radioListItem"
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
