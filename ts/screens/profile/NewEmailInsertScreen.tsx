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
  useContext
} from "react";
import { Alert, Keyboard, SafeAreaView, StyleSheet, View } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import { H1 } from "../../components/core/typography/H1";
import { LabelledItem } from "../../components/LabelledItem";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { ProfileParamsList } from "../../navigation/params/ProfileParamsList";
import { profileUpsert } from "../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { withKeyboard } from "../../utils/keyboard";
import { areStringsEqual } from "../../utils/options";
import { showToast } from "../../utils/showToast";
import { Body } from "../../components/core/typography/Body";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { LightModalContext } from "../../components/ui/LightModal";
import NewRemindEmailValidationOverlay from "../../components/NewRemindEmailValidationOverlay";

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
const NewEmailInsertScreen = (props: Props) => {
  const { showModal } = useContext(LightModalContext);

  const dispatch = useIODispatch();

  const profile = useIOSelector(profileSelector);
  const optionEmail = useIOSelector(profileEmailSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
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

  const handleGoBack = useCallback(() => {
    // goback if the onboarding is completed
    props.navigation.goBack();
  }, [props.navigation]);

  useEffect(() => {
    setEmail(O.some(EMPTY_EMAIL));
  }, []);

  const prevUserProfile = usePrevious(profile);

  useEffect(() => {
    if (prevUserProfile) {
      const isPrevCurrentSameState = prevUserProfile.kind === profile.kind;
      // do nothing if prev profile is in the same state of the current
      if (isPrevCurrentSameState) {
        return;
      }
    }
  }, [prevUserProfile, profile]);

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
          showToast(I18n.t("email.edit.upsert_ko"), "danger");
        }

        // display a toast with error
      } else if (pot.isSome(profile) && !pot.isUpdating(profile)) {
        // the email is correctly inserted
        if (isEmailValidated) {
          handleGoBack();
        } else {
          showModal(<NewRemindEmailValidationOverlay />);
        }
        return;
      }
    }
  }, [handleGoBack, isEmailValidated, prevUserProfile, profile, showModal]);

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <BaseScreenComponent
        goBack={handleGoBack}
        headerTitle={I18n.t("profile.data.list.email")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <SafeAreaView style={styles.flex}>
          <Content noPadded={true} style={styles.flex} scrollEnabled={false}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1 color={"bluegreyDark"} weight={"Bold"}>
                {I18n.t("email.edit.title")}
              </H1>
              <VSpacer />
              <VSpacer size={16} />
              <Body>
                {isEmailValidated
                  ? I18n.t("email.edit.validated")
                  : I18n.t("email.edit.subtitle")}
                <Body weight="SemiBold">
                  {` ${pipe(
                    optionEmail,
                    O.getOrElse(() => "")
                  )}`}
                </Body>
              </Body>
              <VSpacer size={16} />
              <Form>
                <LabelledItem
                  label={I18n.t("email.edit.label")}
                  icon="email"
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

export default NewEmailInsertScreen;
