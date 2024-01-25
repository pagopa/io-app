/**
 * A screen where user after login (with CIE) can set email address if it is
 * not present in the profile.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Form } from "native-base";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
  createRef
} from "react";
import validator from "validator";
import { Alert, Keyboard, SafeAreaView, StyleSheet, View } from "react-native";
import {
  IOColors,
  Icon,
  LabelSmall,
  VSpacer,
  Alert as AlertComponent,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import { H1 } from "../../components/core/typography/H1";
import { LabelledItem } from "../../components/LabelledItem";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { ProfileParamsList } from "../../navigation/params/ProfileParamsList";
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
import { withKeyboard } from "../../utils/keyboard";
import { areStringsEqual } from "../../utils/options";
import { Body } from "../../components/core/typography/Body";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { LightModalContext } from "../../components/ui/LightModal";
import NewRemindEmailValidationOverlay from "../../components/NewRemindEmailValidationOverlay";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import {
  trackEmailDuplicateEditing,
  trackEmailEditing,
  trackEmailEditingError
} from "../analytics/emailAnalytics";
import { getFlowType } from "../../utils/analytics";
import { emailValidationSelector } from "../../store/reducers/emailValidation";
import { emailAcknowledged } from "../../store/actions/onboarding";
import { showToast } from "../../utils/showToast";

export type CduEmailInsertScreenNavigationParams = Readonly<{
  isOnboarding: boolean;
}>;

type Props = IOStackNavigationRouteProps<
  ProfileParamsList,
  "INSERT_EMAIL_SCREEN"
>;

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});

const EMPTY_EMAIL = "";

// TODO: update content (https://www.pivotaltracker.com/n/projects/2048617/stories/169392558)
const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

/**
 * A screen to allow user to insert an email address.
 */
const CduEmailInsertScreen = (props: Props) => {
  const viewRef = createRef<View>();
  const { showModal } = useContext(LightModalContext);

  const dispatch = useIODispatch();

  const profile = useIOSelector(profileSelector);
  const optionEmail = useIOSelector(profileEmailSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const isFirstOnboarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const isProfileEmailAlreadyTaken = useIOSelector(
    isProfileEmailAlreadyTakenSelector
  );

  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const { isOnboarding } = props.route.params ?? {};

  const flow = getFlowType(isOnboarding, isFirstOnBoarding);

  useOnFirstRender(() => {
    if (isProfileEmailAlreadyTaken) {
      trackEmailEditing(flow);
    } else {
      trackEmailDuplicateEditing(flow);
    }
  });

  const acknowledgeOnEmailValidated = useIOSelector(
    emailValidationSelector
  ).acknowledgeOnEmailValidated;

  const prevUserProfile = usePrevious(profile);

  const isLoading = useMemo(
    () => pot.isUpdating(profile) || pot.isLoading(profile),
    [profile]
  );

  const acknowledgeEmail = useCallback(
    () => dispatch(emailAcknowledged()),
    [dispatch]
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

  const getEmail = (email: O.Option<string>) =>
    !isProfileEmailAlreadyTaken ? email : O.some(EMPTY_EMAIL);

  const [areSameEmails, setAreSameEmails] = useState(false);
  const [email, setEmail] = useState(getEmail(optionEmail));

  useEffect(() => {
    if (areSameEmails) {
      trackEmailEditingError(flow);
    }
  }, [areSameEmails, flow]);

  /** validate email returning three possible values:
   * - _true_,      if email is valid.
   * - _false_,     if email has been already changed from the user and it is not
   * valid.
   * - _undefined_, if email field is empty. This state is consumed by
   * LabelledItem Component and it used for style pourposes ONLY.
   */
  const isValidEmail = useCallback(
    () =>
      pipe(
        email,
        O.map(value => {
          if (
            EMPTY_EMAIL === value ||
            !validator.isEmail(value) ||
            areSameEmails
          ) {
            return undefined;
          }
          return E.isRight(EmailString.decode(value));
        }),
        O.toUndefined
      ),
    [areSameEmails, email]
  );
  const isContinueButtonDisabled = !isValidEmail() && !isLoading;

  const continueOnPress = () => {
    Keyboard.dismiss();
    pipe(
      email,
      O.map(e => {
        updateEmail(e as EmailString);
      })
    );
  };

  const renderFooterButtons = () => {
    const continueButtonProps = {
      disabled: isContinueButtonDisabled,
      onPress: continueOnPress,
      label: I18n.t("global.buttons.continue"),
      accessibilityLabel: I18n.t("global.buttons.continue"),
      block: true,
      primary: isValidEmail()
    };

    return (
      <FooterWithButtons
        type={"SingleButton"}
        primary={{
          type: "Solid",
          buttonProps: continueButtonProps
        }}
      />
    );
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
    if (isFirstOnBoarding) {
      setAreSameEmails(
        isProfileEmailAlreadyTaken
          ? areStringsEqual(O.some(value), optionEmail, true)
          : false
      );
    } else {
      setAreSameEmails(areStringsEqual(O.some(value), optionEmail, true));
    }
    setEmail(value !== EMPTY_EMAIL ? O.some(value) : O.none);
  };

  const handleGoBack = useCallback(() => {
    // goback if the onboarding is completed
    props.navigation.goBack();
  }, [props.navigation]);

  useOnFirstRender(() => {
    if (!isFirstOnBoarding) {
      setEmail(O.some(EMPTY_EMAIL));
      setAreSameEmails(false);
    }
  });

  // If we navigate to this screen with acknowledgeOnEmailValidated set to false,
  // we show the modal to remind the user to validate the email.
  // This is used during the check of the email at startup.
  useEffect(() => {
    if (
      O.isSome(acknowledgeOnEmailValidated) &&
      acknowledgeOnEmailValidated.value === false
    ) {
      showModal(
        <NewRemindEmailValidationOverlay isOnboarding={isFirstOnboarding} />
      );
    }
  }, [acknowledgeOnEmailValidated, isFirstOnboarding, showModal]);

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
          showToast(I18n.t("email.edit.upsert_ko"));
        }
        // display a toast with error
      } else if (pot.isSome(profile) && !pot.isUpdating(profile)) {
        // the email is correctly inserted
        if (isEmailValidated) {
          if (!isFirstOnboarding) {
            handleGoBack();
          }
        } else {
          showModal(
            <NewRemindEmailValidationOverlay isOnboarding={isFirstOnboarding} />
          );
        }
        return;
      }
    }
  }, [
    acknowledgeEmail,
    handleGoBack,
    isEmailValidated,
    isFirstOnboarding,
    prevUserProfile,
    profile,
    showModal
  ]);

  const showGoBack = () => {
    if (isFirstOnBoarding) {
      return undefined;
    } else {
      if (!isEmailValidated) {
        return undefined;
      }
      return handleGoBack;
    }
  };

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <BaseScreenComponent
        goBack={showGoBack()}
        headerTitle={
          isFirstOnboarding
            ? I18n.t("email.newinsert.header")
            : I18n.t("profile.data.list.email")
        }
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <SafeAreaView style={styles.flex}>
          <Content
            testID="container-test"
            noPadded={true}
            style={styles.flex}
            scrollEnabled={false}
          >
            <View style={IOStyles.horizontalContentPadding}>
              <H1 color={"bluegreyDark"} weight={"Bold"} testID="title-test">
                {isFirstOnboarding
                  ? I18n.t("email.newinsert.title")
                  : I18n.t("email.edit.title")}
              </H1>
              <VSpacer />
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
              {isProfileEmailAlreadyTaken && isFirstOnboarding && (
                <>
                  <VSpacer size={24} />
                  <AlertComponent
                    testID="alert-test"
                    viewRef={viewRef}
                    variant="info"
                    content={I18n.t("email.newinsert.alert.title", {
                      email: pipe(
                        optionEmail,
                        O.getOrElse(() => EMPTY_EMAIL)
                      )
                    })}
                  />
                </>
              )}
              <VSpacer size={16} />
              <Form>
                <View>
                  <LabelledItem
                    label={
                      isFirstOnboarding
                        ? I18n.t("email.edit.label")
                        : I18n.t("email.newinsert.label")
                    }
                    icon="email"
                    isValid={isValidEmail()}
                    overrideBorderColor={
                      areSameEmails ? IOColors.red : undefined
                    }
                    inputProps={{
                      returnKeyType: "done",
                      // continueOnPress is called by pressing the
                      // button on the keyboard only if the mail is valid
                      onSubmitEditing: isContinueButtonDisabled
                        ? undefined
                        : continueOnPress,
                      autoCapitalize: "none",
                      keyboardType: "email-address",
                      defaultValue: pipe(
                        getEmail(email),
                        O.getOrElse(() => EMPTY_EMAIL)
                      ),
                      onChangeText: handleOnChangeEmailText
                    }}
                    testID="TextField"
                  />
                  {areSameEmails && (
                    <View
                      testID="error-label"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                      }}
                      accessibilityElementsHidden={true}
                      importantForAccessibility="no-hide-descendants"
                    >
                      <View style={{ marginRight: 6 }}>
                        <Icon size={14} name="notice" color="red" />
                      </View>
                      <LabelSmall weight="Regular" color="red">
                        {I18n.t("email.newinsert.alert.description")}
                      </LabelSmall>
                    </View>
                  )}
                </View>
              </Form>
            </View>
          </Content>
          {withKeyboard(renderFooterButtons())}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default CduEmailInsertScreen;
