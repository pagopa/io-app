import * as React from "react";
import { useCallback, useState, useRef } from "react";
import {
  CodeInput,
  H2,
  NumberPad,
  VSpacer,
  LabelSmallAlt,
  Pictogram,
  Body,
  IconButton,
  ContentWrapper,
  ButtonLink,
  IOStyles,
  BiometricsValidType,
  IOPictograms
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Alert, ColorSchemeName, Modal, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "../../i18n";
import { IOStyleVariables } from "../../components/core/variables/IOStyleVariables";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationSuccess
} from "../../store/actions/identification";
import { useIOSelector } from "../../store/hooks";
import {
  identificationFailSelector,
  progressSelector
} from "../../store/reducers/identification";
import { useBiometricType } from "../../utils/hooks/useBiometricType";
import { profileNameSelector } from "../../store/reducers/profile";
import { IdentificationLockModal } from "./IdentificationLockModal";

const PIN_LENGTH = 6;
const VERTICAL_PADDING = 16;

const onRequestCloseHandler = () => undefined;

const getInstructions = (
  biometricType: BiometricsValidType | undefined,
  isBimoetricIdentificatoinFailed: boolean = false
) => {
  if (isBimoetricIdentificatoinFailed) {
    return I18n.t("identification.subtitleCode");
  }

  switch (biometricType) {
    case "BIOMETRICS":
      return I18n.t("identification.subtitleCodeFingerprint");
    case "FACE_ID":
      return I18n.t("identification.subtitleCodeFaceId");
    case "TOUCH_ID":
      return I18n.t("identification.subtitleCodeFingerprint");
    default:
      return I18n.t("identification.subtitleCode");
  }
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const IdentificationModal = () => {
  console.log("Refreshing IdentificationModal 🔁");
  const [value, setValue] = useState("");
  const invalidPin = useRef(false);
  // TODO: forced new blue until we have a proper color mapping on the design system
  const isDesignSystemEnabled = true; // useIOSelector(isDesignSystemEnabledSelector);
  const colorScheme: ColorSchemeName = "light";

  const blueColor = IOStyleVariables.colorPrimary(
    colorScheme,
    isDesignSystemEnabled
  );

  const identificationProgressState = useIOSelector(progressSelector);
  const identificationFailState = useIOSelector(identificationFailSelector);
  const name = useIOSelector(profileNameSelector);
  const biometricType = useBiometricType();

  const biometricsConfig = biometricType
    ? {
        biometricType,
        biometricAccessibilityLabel: "Face ID",
        onBiometricPress: () => Alert.alert("biometric")
      }
    : {};

  const instructions = getInstructions(biometricType);
  const forgotCodeLabel = `${I18n.t(
    "identification.unlockCode.reset.button"
  )} ${I18n.t("identification.unlockCode.reset.code")}?`;
  const closeButtonLabel = I18n.t("global.buttons.close");

  const dispatch = useDispatch();
  const onIdentificationCancel = useCallback(() => {
    dispatch(identificationCancel());
  }, [dispatch]);
  const onIdentificationSuccess = useCallback(() => {
    dispatch(identificationSuccess());
  }, [dispatch]);
  const onIdentificationForceLogout = useCallback(() => {
    dispatch(identificationForceLogout());
  }, [dispatch]);
  const onIdentificationFailure = useCallback(() => {
    dispatch(identificationFailure());
  }, [dispatch]);
  const onIdentificationFailureHandler = useCallback(() => {
    const forceLogout = pipe(
      identificationFailState,
      O.map(failState => failState.remainingAttempts === 1),
      O.getOrElse(() => false)
    );
    if (forceLogout) {
      onIdentificationForceLogout();
    } else {
      onIdentificationFailure();
    }
  }, [
    identificationFailState,
    onIdentificationFailure,
    onIdentificationForceLogout
  ]);

  if (invalidPin.current) {
    // eslint-disable-next-line functional/immutable-data
    invalidPin.current = false;
    onIdentificationFailureHandler();
  }

  const onValueChange = (v: string) => {
    if (v.length <= PIN_LENGTH) {
      setValue(v);
    }
  };

  if (identificationProgressState.kind !== "started") {
    return null;
  }

  const { pin, isValidatingTask, shufflePad } = identificationProgressState;

  const titleLabel = isValidatingTask
    ? I18n.t("identification.titleValidation")
    : name
    ? I18n.t("identification.title", { name })
    : "";

  const onPinValidated = (v: string) => {
    if (v === pin) {
      // Clear the inserted value
      setValue("");
      // Dispatch the success action
      onIdentificationSuccess();
      return true;
    }
    // eslint-disable-next-line functional/immutable-data
    invalidPin.current = true;
    return false;
  };

  const pictogramKey: IOPictograms = isValidatingTask ? "passcode" : "key";

  // eslint-disable-next-line functional/no-let
  let countdown = 0 as Millisecond;
  // eslint-disable-next-line functional/no-let
  let showLockModal = false;
  if (O.isSome(identificationFailState)) {
    showLockModal = identificationFailState.value.showLockModal ?? false;
    if (showLockModal) {
      // eslint-disable-next-line functional/immutable-data
      countdown = (identificationFailState.value.timespanBetweenAttempts *
        1000) as Millisecond;
    }
  }

  return showLockModal ? (
    <IdentificationLockModal countdown={countdown} />
  ) : (
    <Modal
      statusBarTranslucent
      transparent
      onRequestClose={onRequestCloseHandler}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: blueColor }]}>
        {isValidatingTask && (
          <View style={styles.closeButton}>
            <ContentWrapper>
              <VSpacer size={VERTICAL_PADDING} />
              <IconButton
                icon={"closeLarge"}
                color="contrast"
                onPress={() => {
                  onIdentificationCancel();
                }}
                accessibilityLabel={closeButtonLabel}
              />
            </ContentWrapper>
          </View>
        )}
        <ScrollView
          centerContent={true}
          contentContainerStyle={[
            styles.scrollViewContentContainer,
            {
              justifyContent: isValidatingTask ? undefined : "center"
            }
          ]}
        >
          <ContentWrapper>
            <View style={IOStyles.alignCenter}>
              <VSpacer size={16} />
              <Pictogram
                pictogramStyle="light-content"
                name={pictogramKey}
                size={64}
              />
              <VSpacer size={8} />
              <H2 color={"white"}>{titleLabel}</H2>
              <VSpacer size={8} />
              <Body accessibilityLabel={instructions} color={"white"}>
                {instructions}
              </Body>
            </View>
            <VSpacer size={32} />
            <View style={IOStyles.alignCenter}>
              <View style={styles.smallPinLabel}>
                <LabelSmallAlt color={"white"}>{value}</LabelSmallAlt>
              </View>
              <CodeInput
                value={value}
                length={PIN_LENGTH}
                variant={"light"}
                onValueChange={onValueChange}
                onValidate={onPinValidated}
              />
            </View>
            <VSpacer size={48} />
            <View>
              <NumberPad
                value={value}
                deleteAccessibilityLabel="Delete"
                onValueChange={onValueChange}
                variant={"dark"} // TODO: missing mapping for standard blue
                // shufflePad={shufflePad} // TODO: missing
                {...biometricsConfig}
              />
              <VSpacer size={32} />
              <View style={IOStyles.selfCenter}>
                <ButtonLink
                  accessibilityLabel={forgotCodeLabel}
                  color="contrast"
                  label={forgotCodeLabel}
                  onPress={() => Alert.alert("Forgot unlock code")}
                />
                <VSpacer size={VERTICAL_PADDING} />
              </View>
            </View>
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flexGrow: 1 },
  closeButton: {
    zIndex: 100,
    flexGrow: 1,
    alignItems: "flex-end"
  },
  scrollViewContentContainer: {
    flexGrow: 1
  },
  smallPinLabel: {
    position: "absolute",
    alignItems: "center",
    opacity: 0.5,
    bottom: -32
  }
});

export default IdentificationModal;
