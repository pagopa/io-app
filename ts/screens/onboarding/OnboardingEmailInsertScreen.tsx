/**
 * A screen where user after login (with CIE) can set email address if it is
 * not present in the profile.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import { StackActions } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Form } from "native-base";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { H1 } from "../../components/core/typography/H1";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { LabelledItem } from "../../components/LabelledItem";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import ROUTES from "../../navigation/routes";
import { abortOnboarding, emailInsert } from "../../store/actions/onboarding";
import { profileLoadRequest, profileUpsert } from "../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { withKeyboard } from "../../utils/keyboard";
import { areStringsEqual } from "../../utils/options";
import { showToast } from "../../utils/showToast";
import { Body } from "../../components/core/typography/Body";
import { IOStyles } from "../../components/core/variables/IOStyles";

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_INSERT_EMAIL_SCREEN"
>;

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  icon: {
    marginTop: Platform.OS === "android" ? 4 : 6 // adjust icon position to align it with baseline of email text}
  }
});

const EMPTY_EMAIL = "";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

/**
 * A screen to allow user to insert an email address.
 */
const OnboardingEmailInsertScreen = (props: Props) => {
  const dispatch = useIODispatch();

  const profile = useIOSelector(profileSelector);
  const optionEmail = useIOSelector(profileEmailSelector);
  const isLoading = useMemo(
    () => pot.isUpdating(profile) || pot.isLoading(profile),
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
  const acknowledgeEmailInsert = useCallback(
    () => dispatch(emailInsert()),
    [dispatch]
  );
  const requestAbortOnboarding = useCallback(
    () => dispatch(abortOnboarding()),
    [dispatch]
  );
  const reloadProfile = useCallback(
    () => dispatch(profileLoadRequest()),
    [dispatch]
  );

  const [isMounted, setIsMounted] = useState(true);
  const [email, setEmail] = useState(optionEmail);

  /** validate email returning three possible values:
   * - _true_,      if email is valid.
   * - _false_,     if email has been already changed from the user and it is not
   * valid.
   * - _undefined_, if email field is empty. This state is consumed by
   * LabelledItem Component and it used for style pourposes ONLY.
   */
  const isValidEmail = () =>
    pipe(
      email,
      O.map(value => {
        if (EMPTY_EMAIL === value) {
          return undefined;
        }
        return E.isRight(EmailString.decode(value));
      }),
      O.toUndefined
    );

  const continueOnPress = () => {
    Keyboard.dismiss();
    if (isValidEmail()) {
      // The profile is reloaded to check if the user email
      // has been updated within another session
      reloadProfile();
    }
  };

  const renderFooterButtons = () => {
    const continueButtonProps = {
      disabled: isValidEmail() !== true && !isLoading,
      onPress: continueOnPress,
      title: I18n.t("global.buttons.continue"),
      block: true,
      primary: isValidEmail()
    };

    return (
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={continueButtonProps}
      />
    );
  };

  const handleOnChangeEmailText = (value: string) => {
    setEmail(value !== EMPTY_EMAIL ? O.some(value) : O.none);
  };

  const navigateToEmailReadScreen = useCallback(() => {
    props.navigation.dispatch(StackActions.popToTop());
    props.navigation.navigate(ROUTES.ONBOARDING_READ_EMAIL_SCREEN);
  }, [props.navigation]);

  useEffect(() => {
    if (!isMounted) {
      navigateToEmailReadScreen();
    }
  }, [isMounted, navigateToEmailReadScreen]);

  const handleGoBack = useCallback(() => {
    // if the onboarding is not completed and the email is set, force goback with a reset (user could edit his email and go back without saving)
    // see https://www.pivotaltracker.com/story/show/171424350
    if (O.isSome(optionEmail)) {
      setIsMounted(false);
    } else {
      // if the user is in onboarding phase, go back has to
      // abort login (an user with no email can't access the home)
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
            onPress: requestAbortOnboarding
          }
        ]
      );
    }
  }, [requestAbortOnboarding, optionEmail]);

  const prevUserProfile = usePrevious(profile);

  const prevOptionEmail = usePrevious(optionEmail);

  useEffect(() => {
    // When the profile reload is completed, check if the email is changed since the last reload
    if (
      prevUserProfile &&
      pot.isLoading(prevUserProfile) &&
      !pot.isLoading(profile)
    ) {
      // Check both if the email has been changed within another session and
      // if the inserted email match with the email stored into the user profile
      const isTheSameEmail = areStringsEqual(optionEmail, email, true);
      if (!isTheSameEmail) {
        pipe(
          email,
          O.map(e => {
            updateEmail(e as EmailString);
          })
        );
      } else {
        Alert.alert(I18n.t("email.insert.alert"));
      }
    }
  }, [email, prevUserProfile, profile, optionEmail, updateEmail]);

  useEffect(() => {
    if (prevUserProfile && pot.isUpdating(prevUserProfile)) {
      if (pot.isError(profile)) {
        // display a toast with error
        showToast(I18n.t("email.edit.upsert_ko"), "danger");
      } else if (pot.isSome(profile)) {
        // user is inserting his email from onboarding phase
        // he comes from checkAcknowledgedEmailSaga if onboarding is not finished yet
        // and he has not an email
        if (prevOptionEmail && O.isNone(prevOptionEmail)) {
          // since this screen is mounted from saga it won't be unmounted because on saga
          // we have a direct navigation instead of back
          // so we have to force a reset (to get this screen unmounted) and navigate to emailReadScreen
          // isMounted is used as a guard to prevent update while the screen is unmounting
          acknowledgeEmailInsert();
          setIsMounted(false);
          return;
        }
        // go back (to the EmailReadScreen)
        handleGoBack();
        return;
      }
    }
  }, [
    acknowledgeEmailInsert,
    handleGoBack,
    prevOptionEmail,
    prevUserProfile,
    profile
  ]);

  useEffect(() => {
    if (prevUserProfile) {
      const isPrevCurrentSameState = prevUserProfile.kind === profile.kind;
      // do nothing if prev profile is in the same state of the current
      if (isMounted || isPrevCurrentSameState) {
        return;
      }
    }
  }, [prevUserProfile, profile, isMounted]);

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <BaseScreenComponent
        goBack={handleGoBack}
        headerTitle={I18n.t("email.insert.header")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <SafeAreaView style={styles.flex}>
          <Content noPadded={true} style={styles.flex} scrollEnabled={false}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1 color={"bluegreyDark"} weight={"Bold"}>
                {I18n.t("email.insert.title")}
              </H1>
              <VSpacer size={16} />
              <Body>{I18n.t("email.insert.subtitle")}</Body>
              <VSpacer size={16} />
              <Form>
                <LabelledItem
                  label={I18n.t("email.insert.label")}
                  icon="io-envelope"
                  isValid={isValidEmail()}
                  inputProps={{
                    returnKeyType: "done",
                    onSubmitEditing: continueOnPress,
                    autoCapitalize: "none",
                    keyboardType: "email-address",
                    value: pipe(
                      email,
                      O.getOrElse(() => EMPTY_EMAIL)
                    ),
                    onChangeText: handleOnChangeEmailText
                  }}
                  iconStyle={styles.icon}
                />
              </Form>
            </View>
          </Content>

          {withKeyboard(renderFooterButtons())}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default OnboardingEmailInsertScreen;
