/**
 * A screen where user after login can set email address if it is
 * not present in the profile or if it is already used.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { View, Keyboard, SafeAreaView, StyleSheet, Alert } from "react-native";
import validator from "validator";
import { IOColors, Icon, LabelSmall } from "@pagopa/io-app-design-system";
import { StackActions } from "@react-navigation/native";
import { Alert as AlertComponent } from "../../components/Alert";
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
import { profileLoadRequest, profileUpsert } from "../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { withKeyboard } from "../../utils/keyboard";
import { areStringsEqual } from "../../utils/options";
import { Body } from "../../components/core/typography/Body";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ROUTES from "../../navigation/routes";
import { emailInsert } from "../../store/actions/onboarding";

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_INSERT_EMAIL_SCREEN"
>;

const styles = StyleSheet.create({
  flex: {
    flex: 1
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
const NewOnboardingEmailInsertScreen = (props: Props) => {
  const dispatch = useIODispatch();

  // FIXME - < https://pagopa.atlassian.net/browse/IOPID-690> change this state logic and name (this value will be retrive by the backend)
  const [isCduEmail] = useState<boolean>(false);

  const viewRef = React.createRef<View>();

  const profile = useIOSelector(profileSelector);
  const optionEmail = useIOSelector(profileEmailSelector);

  const isLoading = useMemo(
    () => pot.isUpdating(profile) || pot.isLoading(profile),
    [profile]
  );

  const reloadProfile = useCallback(
    () => dispatch(profileLoadRequest()),
    [dispatch]
  );

  const acknowledgeEmailInsert = useCallback(
    () => dispatch(emailInsert()),
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

  const [email, setEmail] = useState(isCduEmail ? optionEmail : O.none);

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
        if (
          EMPTY_EMAIL === value ||
          !validator.isEmail(value) ||
          isSameEmailToChange()
        ) {
          return undefined;
        }
        return E.isRight(EmailString.decode(value));
      }),
      O.toUndefined
    );

  /**
   * This function control if the email is the same that the user need to change
   * @returns boolean
   */
  const isSameEmailToChange = () =>
    !isCduEmail ? areStringsEqual(email, optionEmail, true) : false;

  /**
   * This function control if the email is already used
   * @returns boolean
   *
   * FIXME - < https://pagopa.atlassian.net/browse/IOPID-690> this function need to be integrated with API that control if the email already exists
   */
  const isExistingEmail = () => {
    const showAlertExistsEmail: boolean = false;
    if (showAlertExistsEmail) {
      Alert.alert(
        I18n.t("email.newinsert.alert.modaltitle"),
        I18n.t("email.newinsert.alert.modaldescription"),
        [
          {
            text: I18n.t("email.newinsert.alert.modalbutton"),
            style: "cancel"
          }
        ]
      );
    }
    return showAlertExistsEmail;
  };

  const navigateToEmailReadScreen = useCallback(() => {
    props.navigation.dispatch(StackActions.popToTop());
    props.navigation.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_READ_EMAIL_SCREEN
    });
  }, [props.navigation]);

  const continueOnPress = () => {
    Keyboard.dismiss();
    if (!isExistingEmail()) {
      pipe(
        email,
        O.map(e => {
          updateEmail(e as EmailString);
        })
      );
      acknowledgeEmailInsert();
      reloadProfile();
      navigateToEmailReadScreen();
    }
  };

  const renderFooterButtons = () => {
    const continueButtonProps = {
      disabled: !isValidEmail() && !isLoading,
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

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <BaseScreenComponent
        headerTitle={I18n.t("email.newinsert.header")}
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
                {I18n.t("email.newinsert.title")}
              </H1>
              <VSpacer size={16} />
              <Body>{I18n.t("email.newinsert.subtitle")}</Body>
              {!isCduEmail && (
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
              <VSpacer size={24} />

              <View>
                <LabelledItem
                  label={I18n.t("email.newinsert.label")}
                  icon="email"
                  isValid={isValidEmail()}
                  overrideBorderColor={
                    isSameEmailToChange() ? IOColors.red : undefined
                  }
                  inputProps={{
                    returnKeyType: "done",
                    onSubmitEditing: continueOnPress,
                    autoCapitalize: "none",
                    keyboardType: "email-address",
                    defaultValue: isCduEmail
                      ? pipe(
                          email,
                          O.getOrElse(() => EMPTY_EMAIL)
                        )
                      : EMPTY_EMAIL,
                    onChangeText: handleOnChangeEmailText
                  }}
                  testID="TextField"
                />
                {isSameEmailToChange() && (
                  <View
                    testID="error-label"
                    style={{
                      position: "absolute",
                      bottom: -25,
                      left: 2,
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
            </View>
          </Content>
          {withKeyboard(renderFooterButtons())}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default NewOnboardingEmailInsertScreen;
