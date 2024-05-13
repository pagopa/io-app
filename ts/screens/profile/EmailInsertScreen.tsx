/**
 * A screen where user after login (with CIE) can set email address if it is
 * not present in the profile.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import validator from "validator";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet
} from "react-native";
import {
  VSpacer,
  H1,
  TextInputValidation,
  ContentWrapper,
  ButtonSolid,
  IOToast
} from "@pagopa/io-app-design-system";
import { Route, useFocusEffect, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import themeVariables from "../../theme/variables";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { profileUpsert } from "../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  isProfileEmailAlreadyTakenSelector,
  isProfileEmailValidatedSelector,
  isProfileFirstOnBoardingSelector,
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { areStringsEqual } from "../../utils/options";
import { Body } from "../../components/core/typography/Body";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import {
  trackEmailDuplicateEditing,
  trackEmailEditing,
  trackEmailEditingError,
  trackSendValidationEmail
} from "../analytics/emailAnalytics";
import { getFlowType } from "../../utils/analytics";
import { emailValidationSelector } from "../../store/reducers/emailValidation";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { trackTosUserExit } from "../authentication/analytics";
import { abortOnboarding } from "../../store/actions/onboarding";
import ROUTES from "../../navigation/routes";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { setAccessibilityFocus } from "../../utils/accessibility";

export type EmailInsertScreenNavigationParams = Readonly<{
  isOnboarding: boolean;
  isFciEditEmailFlow?: boolean;
  isEditingPreviouslyInsertedEmailMode?: boolean;
}>;

const EMPTY_EMAIL = "";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

/**
 * A screen to allow user to insert an email address.
 */
const EmailInsertScreen = () => {
  const {
    isOnboarding,
    isFciEditEmailFlow,
    isEditingPreviouslyInsertedEmailMode
  } =
    useRoute<
      Route<
        "ONBOARDING_INSERT_EMAIL_SCREEN" | "INSERT_EMAIL_SCREEN",
        EmailInsertScreenNavigationParams
      >
    >().params;
  const navigation = useIONavigation();

  const dispatch = useIODispatch();

  const profile = useIOSelector(profileSelector);
  const optionEmail = useIOSelector(profileEmailSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const isFirstOnboarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const isProfileEmailAlreadyTaken = useIOSelector(
    isProfileEmailAlreadyTakenSelector
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const flow = getFlowType(isOnboarding, isFirstOnboarding);
  const accessibilityFirstFocuseViewRef = useRef<View>(null);
  // This reference is used to prevent the refresh visual glitch
  // caused by the polling stop in the email validation screen.
  const canShowLoadingSpinner = useRef(true);

  useFocusEffect(() => setAccessibilityFocus(accessibilityFirstFocuseViewRef));

  useOnFirstRender(() => {
    if (isProfileEmailAlreadyTaken) {
      trackEmailEditing(flow);
      if (isFirstOnboarding) {
        IOToast.info(
          I18n.t("email.newinsert.alert.title", {
            email: pipe(
              optionEmail,
              O.getOrElse(() => EMPTY_EMAIL)
            )
          })
        );
      }
    } else {
      trackEmailDuplicateEditing(flow);
    }
  });

  const acknowledgeOnEmailValidated = useIOSelector(
    emailValidationSelector
  ).acknowledgeOnEmailValidated;

  const prevUserProfile = usePrevious(profile);

  const isLoading = useMemo(
    () =>
      (pot.isUpdating(profile) || pot.isLoading(profile)) &&
      canShowLoadingSpinner.current,
    [profile]
  );

  const updateEmail = useCallback(
    (email: EmailString) =>
      dispatch(
        profileUpsert.request({
          email
        })
      ),
    [dispatch]
  );

  const dispatchAbortOnboarding = useCallback(
    () => dispatch(abortOnboarding()),
    [dispatch]
  );

  const getEmail = (email: O.Option<string>) =>
    !isProfileEmailAlreadyTaken ? email : O.some(EMPTY_EMAIL);

  const [areSameEmails, setAreSameEmails] = useState(false);
  const [email, setEmail] = useState(getEmail(optionEmail));

  useEffect(() => {
    if (areSameEmails) {
      trackEmailEditingError(flow);
    }
  }, [areSameEmails, flow]);

  const sameEmailsErrorRender = useCallback(() => {
    if (isProfileEmailAlreadyTaken && isFirstOnboarding) {
      setErrorMessage(I18n.t("email.newinsert.alert.description1"));
      return;
    }
    if (isOnboarding) {
      setErrorMessage(I18n.t("email.newinsert.alert.description2"));
      return;
    }
    if (!isOnboarding && !isFirstOnboarding) {
      setErrorMessage(I18n.t("email.newinsert.alert.description3"));
      return;
    }
    setErrorMessage(I18n.t("email.newinsert.alert.description1"));
  }, [isFirstOnboarding, isOnboarding, isProfileEmailAlreadyTaken]);

  /** validate email returning two possible values:
   * - _true_,      if email is valid.
   * - _false_,     if email has been already changed from the user and it is not
   * valid.
   */
  const isValidEmail = useCallback(
    () =>
      pipe(
        email,
        O.fold(
          () => {
            setErrorMessage(I18n.t("email.newinsert.alert.invalidemail"));
            return false;
          },
          value => {
            if (!validator.isEmail(value)) {
              setErrorMessage(I18n.t("email.newinsert.alert.invalidemail"));
              return false;
            }
            if (areSameEmails) {
              sameEmailsErrorRender();
              return false;
            }
            return true;
          }
        )
      ),
    [areSameEmails, email, sameEmailsErrorRender]
  );

  const continueOnPress = () => {
    Keyboard.dismiss();
    // eslint-disable-next-line functional/immutable-data
    canShowLoadingSpinner.current = true;
    if (isValidEmail()) {
      pipe(
        email,
        O.map(e => {
          updateEmail(e as EmailString);
        })
      );
      if (isFirstOnboarding) {
        trackSendValidationEmail(flow);
      }
    }
  };

  const handleOnChangeEmailText = (value: string) => {
    /**
     * SCENARIOS:
     * 1. first onboarding and email already taken => if the CIT writes
     *    the same email as the one he has to modify, he is blocked.
     * 2. first onboarding and NOT email already taken => in this case,
     *    the CIT does not need his email to be compared with another one,
     *    so the areSameEmails will always be false.
     * 3. Not first onboarding => if the CIT write the same email as the one
     *    he already has, he is blocked.
     */
    // If we are editing the email previously inserted
    // we don't want to show the error message.
    if (!isEditingPreviouslyInsertedEmailMode) {
      if (isFirstOnboarding) {
        setAreSameEmails(
          isProfileEmailAlreadyTaken
            ? areStringsEqual(O.some(value), optionEmail, true)
            : false
        );
      } else {
        setAreSameEmails(areStringsEqual(O.some(value), optionEmail, true));
      }
    }
    setEmail(value !== EMPTY_EMAIL ? O.some(value) : O.none);
  };

  const handleGoBack = useCallback(() => {
    // click on goback icon
    // if the flow is onboarding, a warning is displayed at the click
    if (isFirstOnboarding) {
      Alert.alert(
        I18n.t("onboarding.alert.title"),
        I18n.t("onboarding.alert.description"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.exit"),
            style: "default",
            onPress: () => {
              trackTosUserExit(getFlowType(true, isFirstOnboarding));
              dispatchAbortOnboarding();
            }
          }
        ]
      );
      // if the flow isn't first onboarding/onboarding
      // the button allows you to return to the previous step
    } else {
      navigation.goBack();
    }
  }, [dispatchAbortOnboarding, isFirstOnboarding, navigation]);

  useOnFirstRender(() => {
    if (!isFirstOnboarding) {
      setEmail(O.some(EMPTY_EMAIL));
      setAreSameEmails(false);
    }
  });

  const userNavigateToEmailValidationScreen =
    O.isSome(acknowledgeOnEmailValidated) &&
    acknowledgeOnEmailValidated.value === false &&
    isOnboarding;

  // If we navigate to this screen with acknowledgeOnEmailValidated set to false,
  // let the user navigate the email validation screen
  useEffect(() => {
    if (userNavigateToEmailValidationScreen) {
      // eslint-disable-next-line functional/immutable-data
      canShowLoadingSpinner.current = false;
      navigation.navigate(ROUTES.ONBOARDING, {
        screen: ROUTES.ONBOARDING_EMAIL_VERIFICATION_SCREEN,
        params: {
          isOnboarding,
          sendEmailAtFirstRender: isOnboarding
        }
      });
    }
  }, [isOnboarding, navigation, userNavigateToEmailValidationScreen]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    if (prevUserProfile && pot.isUpdating(prevUserProfile)) {
      if (pot.isError(profile)) {
        // the user is trying to enter an email already in use
        if (profile.error.type === "PROFILE_EMAIL_IS_NOT_UNIQUE_ERROR") {
          Alert.alert(
            I18n.t("email.insert.alertTitle"),
            I18n.t("email.insert.alertDescription"),
            [
              {
                text: I18n.t("email.insert.alertButton"),
                style: "cancel"
              }
            ]
          );
        } else {
          IOToast.error(I18n.t("email.edit.upsert_ko"));
        }
        // display a toast with error
      } else if (pot.isSome(profile) && !pot.isUpdating(profile)) {
        // the email is correctly inserted

        // if the email is entered and when the 'confirm' button
        // is clicked the session has expired, when the session
        // is refreshed the profile is updated and the email is
        // validated because we are still using the old email.
        // In order to prevent the user navigating to the email
        // validation screen we use this control to allow the user
        // to remain in this screen
        if (isEmailValidated) {
          if (!isFirstOnboarding) {
            return;
          }
        } else {
          // eslint-disable-next-line functional/no-let
          let sendEmailAtFirstRender = false;
          // the IO BE orchestrator already send an email
          // if the previous profile email is different from the current one.
          if (pot.isSome(prevUserProfile)) {
            // So we need to check if the email is not changed
            // to send the email validation process programmatically.
            sendEmailAtFirstRender =
              profile.value.email === prevUserProfile.value.email;
          }
          // eslint-disable-next-line functional/immutable-data
          canShowLoadingSpinner.current = false;
          if (isOnboarding) {
            navigation.navigate(ROUTES.ONBOARDING, {
              screen: ROUTES.ONBOARDING_EMAIL_VERIFICATION_SCREEN,
              params: {
                isOnboarding,
                sendEmailAtFirstRender: isOnboarding
              }
            });
          } else {
            navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
              screen: ROUTES.EMAIL_VERIFICATION_SCREEN,
              params: {
                isOnboarding: false,
                sendEmailAtFirstRender,
                isFciEditEmailFlow
              }
            });
          }
        }
      }
    }
  }, [
    handleGoBack,
    isEmailValidated,
    isFciEditEmailFlow,
    isFirstOnboarding,
    isOnboarding,
    navigation,
    prevUserProfile,
    profile
  ]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    goBack: handleGoBack,
    canGoBack: isEmailValidated || isFirstOnboarding
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <SafeAreaView
        testID="container-test"
        edges={["bottom"]}
        style={styles.safeArea}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
          <ContentWrapper>
            <View accessible={true} ref={accessibilityFirstFocuseViewRef}>
              <H1 testID="title-test">
                {isFirstOnboarding
                  ? I18n.t("email.newinsert.title")
                  : I18n.t("email.edit.title")}
              </H1>
            </View>
            <VSpacer size={16} />
            <Body>
              {isFirstOnboarding ? (
                I18n.t("email.newinsert.subtitle")
              ) : (
                <>
                  {I18n.t("email.edit.subtitle")}
                  <Body weight="SemiBold">
                    {` ${pipe(
                      optionEmail,
                      O.getOrElse(() => "")
                    )}`}
                  </Body>
                </>
              )}
            </Body>
            <VSpacer size={16} />
            <TextInputValidation
              autoFocus={!userNavigateToEmailValidationScreen}
              textInputProps={{
                autoCorrect: false,
                autoCapitalize: "none",
                inputMode: true
              }}
              accessibilityLabel={I18n.t("email.newinsert.label")}
              placeholder={I18n.t("email.newinsert.label")}
              onValidate={isValidEmail}
              errorMessage={errorMessage}
              value={pipe(
                email,
                O.getOrElse(() => EMPTY_EMAIL)
              )}
              onChangeText={handleOnChangeEmailText}
            />
          </ContentWrapper>
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? undefined : "padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 110 + 16,
            android: themeVariables.contentPadding
          })}
        >
          <ContentWrapper>
            <ButtonSolid
              label={I18n.t("global.buttons.continue")}
              accessibilityLabel={I18n.t("global.buttons.continue")}
              onPress={continueOnPress}
              fullWidth={true}
            />
            <VSpacer size={16} />
          </ContentWrapper>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LoadingSpinnerOverlay>
  );
};

export default EmailInsertScreen;

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1
  },
  scrollViewContentContainer: {
    flexGrow: 1
  }
});
