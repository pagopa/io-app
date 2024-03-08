import * as React from "react";
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
  IOStyles
} from "@pagopa/io-app-design-system";
import {
  Alert,
  ColorSchemeName,
  Modal,
  View,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import I18n from "../../i18n";
import { IOStyleVariables } from "../../components/core/variables/IOStyleVariables";
import {
  identificationCancel,
  identificationSuccess
} from "../../store/actions/identification";
import { useIOSelector } from "../../store/hooks";
import { progressSelector } from "../../store/reducers/identification";

const PIN_LENGTH = 6;
const VERTICAL_PADDING = 16;

// Avoid the modal to be dismissed by the user
const onRequestCloseHandler = () => undefined;

const IdentificationModal = () => {
  const [value, setValue] = React.useState("");
  // TODO: forced new blue until we have a proper color mapping on the design system
  const isDesignSystemEnabled = true; // useIOSelector(isDesignSystemEnabledSelector);
  const colorScheme: ColorSchemeName = "light";

  const blueColor = IOStyleVariables.colorPrimary(
    colorScheme,
    isDesignSystemEnabled
  );

  const identificationProgressState = useIOSelector(progressSelector);

  const dispatch = useDispatch();
  const onIdentificationCancel = () => dispatch(identificationCancel());
  const onIdentificationSuccess = () => dispatch(identificationSuccess());

  const onValueChange = (v: string) => {
    if (v.length <= PIN_LENGTH) {
      setValue(v);
    }
  };

  const windowDimentions = useWindowDimensions();

  if (identificationProgressState.kind !== "started") {
    return null;
  }

  const { pin } = identificationProgressState;

  const onPinValidated = (v: string) => {
    if (v === pin) {
      console.log("pin validated 👍");
      onIdentificationSuccess();
      return true;
    }
    return false;
  };

  return (
    <Modal
      statusBarTranslucent
      transparent
      onRequestClose={onRequestCloseHandler}
    >
      <SafeAreaView style={{ flexGrow: 1, backgroundColor: blueColor }}>
        <View
          style={{
            zIndex: 100,
            flexGrow: 1,
            alignItems: "flex-end"
          }}
        >
          <ContentWrapper>
            <VSpacer size={VERTICAL_PADDING} />
            <IconButton
              icon={"closeLarge"}
              color="contrast"
              onPress={() => {
                console.log("cancel 👈");
                onIdentificationCancel();
              }}
              accessibilityLabel={"backAccessibilityLabel"}
            />
          </ContentWrapper>
        </View>
        <ScrollView
          centerContent={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <ContentWrapper>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <VSpacer size={16} />
              <Pictogram name="key" size={64} />
              <VSpacer size={8} />
              <H2 color={"white"}>Ciao {`{name}`},</H2>
              <VSpacer size={8} />
              <Body color={"white"}>
                {"per accedere usa il volto o il codice di sblocco"}
              </Body>
            </View>
            <VSpacer size={32} />
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  position: "absolute",
                  alignItems: "center",
                  opacity: 0.5,
                  bottom: -32
                }}
              >
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
                variant={"dark"}
                biometricType="FACE_ID"
                biometricAccessibilityLabel="Face ID"
                onBiometricPress={() => Alert.alert("biometric")}
              />
              <VSpacer size={32} />
              <View style={IOStyles.selfCenter}>
                <ButtonLink
                  accessibilityLabel={"Hai dimenticato il codice di sblocco?"}
                  color="contrast"
                  label={"Hai dimenticato il codice di sblocco?"}
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

export default IdentificationModal;
