import { Text as NBText } from "native-base";
import { View, StyleSheet, Alert } from "react-native";
import * as React from "react";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ButtonExtendedOutline } from "../../../components/ui/ButtonExtendedOutline";
import { ButtonSolid } from "../../../components/ui/ButtonSolid";
import { ButtonOutline } from "../../../components/ui/ButtonOutline";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
import BlockButtons from "../../../components/ui/BlockButtons";
import { ViewEUCovidButton } from "../../euCovidCert/components/ViewEUCovidButton";
import PaymentButton from "../../../components/messages/MessageDetail/common/PaymentButton";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import IconFont from "../../../components/ui/IconFont";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import IconButton from "../../../components/ui/IconButton";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import IconButtonSolid from "../../../components/ui/IconButtonSolid";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";

const styles = StyleSheet.create({
  primaryBlockLegacy: {
    backgroundColor: IOColors.blue,
    padding: 16,
    borderRadius: 8
  },
  primaryBlock: {
    backgroundColor: IOColors["blueIO-500"],
    padding: 16,
    borderRadius: 16
  }
});

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export const DSButtons = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <DesignSystemScreen title={"Buttons"}>
      {/* The title should be dynamic, got from the route object */}
      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        ButtonSolid
      </H2>
      <DSComponentViewerBox name="ButtonSolid · Primary Variant (using Pressable API)">
        <ButtonSolid
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          onPress={onButtonPress}
        />

        <VSpacer size={16} />

        <View style={{ alignSelf: "center" }}>
          <ButtonSolid
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (centered)"}
            onPress={onButtonPress}
          />
        </View>

        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonSolid
                small
                label={"Primary button (small)"}
                accessibilityLabel="Tap to trigger test alert"
                onPress={onButtonPress}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ButtonSolid · Primary, Full width">
        <View>
          <ButtonSolid
            fullWidth
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (full width)"}
            onPress={onButtonPress}
          />
        </View>

        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonSolid
                small
                fullWidth
                accessibilityLabel="Tap to trigger test alert"
                label={"Primary button (small, full width)"}
                onPress={onButtonPress}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ButtonSolid · Primary, disabled">
        <View>
          <ButtonSolid
            disabled
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (disabled)"}
            onPress={onButtonPress}
          />
        </View>
        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonSolid
                small
                disabled={true}
                fullWidth
                accessibilityLabel="Tap to trigger test alert"
                label={"Primary button (small, full, disabled)"}
                onPress={onButtonPress}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>

      <DSComponentViewerBox name="ButtonSolid · Danger variant">
        <View>
          <ButtonSolid
            color="danger"
            label={"Danger button"}
            onPress={onButtonPress}
            accessibilityLabel="Tap to trigger test alert"
          />
        </View>
        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonSolid
                small
                color="danger"
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger button (small)"}
                onPress={onButtonPress}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ButtonSolid · Danger, full width">
        <View>
          <ButtonSolid
            fullWidth
            color="danger"
            accessibilityLabel="Tap to trigger test alert"
            label={"Danger button (full width)"}
            onPress={onButtonPress}
          />
        </View>
        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonSolid
                small
                fullWidth
                color="danger"
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger Button (Small, Full Width)"}
                onPress={onButtonPress}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>

      <DSComponentViewerBox name="ButtonSolid · Danger, disabled">
        <View>
          <ButtonSolid
            color="danger"
            disabled
            accessibilityLabel="Tap to trigger test alert"
            label={"Danger button (disabled)"}
            onPress={onButtonPress}
          />
        </View>
        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonSolid
                color="danger"
                small
                disabled
                fullWidth
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger Button (small, full, disabled)"}
                onPress={onButtonPress}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>

      <View
        style={
          isDesignSystemEnabled
            ? styles.primaryBlock
            : styles.primaryBlockLegacy
        }
      >
        <DSComponentViewerBox
          name="ButtonSolid · Contrast variant"
          colorMode="dark"
        >
          <View>
            <ButtonSolid
              color="contrast"
              label={"Contrast button"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </View>
          {!isDesignSystemEnabled && (
            <>
              <VSpacer size={16} />
              <View>
                <ButtonSolid
                  small
                  color="contrast"
                  accessibilityLabel="Tap to trigger test alert"
                  label={"Contrast button (small)"}
                  onPress={onButtonPress}
                />
              </View>
            </>
          )}
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonSolid · Contrast, full width"
          colorMode="dark"
        >
          <View>
            <ButtonSolid
              fullWidth
              color="contrast"
              label={"Contrast button"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </View>
          {!isDesignSystemEnabled && (
            <>
              <VSpacer size={16} />
              <View>
                <ButtonSolid
                  small
                  fullWidth
                  color="contrast"
                  accessibilityLabel="Tap to trigger test alert"
                  label={"Contrast button (small)"}
                  onPress={onButtonPress}
                />
              </View>
            </>
          )}
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonSolid · Contrast, disabled"
          colorMode="dark"
          last
        >
          <View>
            <ButtonSolid
              disabled
              color="contrast"
              label={"Contrast button (disabled)"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </View>
          {!isDesignSystemEnabled && (
            <>
              <VSpacer size={16} />
              <View>
                <ButtonSolid
                  small
                  fullWidth
                  disabled
                  color="contrast"
                  accessibilityLabel="Tap to trigger test alert"
                  label={"Contrast button (small, full, disabled)"}
                  onPress={onButtonPress}
                />
              </View>
            </>
          )}
        </DSComponentViewerBox>
      </View>

      <VSpacer size={40} />

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        ButtonOutline
      </H2>
      <DSComponentViewerBox name="ButtonOutline · Primary variant (using Pressable API)">
        <ButtonOutline
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          onPress={() => {
            alert("Action triggered");
          }}
        />

        <VSpacer size={16} />

        <View style={{ alignSelf: "center" }}>
          <ButtonOutline
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (centered)"}
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>

        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                small
                label={"Primary button (small)"}
                accessibilityLabel="Tap to trigger test alert"
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ButtonOutline · Primary, full width">
        <View>
          <ButtonOutline
            fullWidth
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (full width)"}
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>
        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                small
                fullWidth
                accessibilityLabel="Tap to trigger test alert"
                label={"Primary button (small, full width)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ButtonOutline · Primary, disabled">
        <View>
          <ButtonOutline
            disabled
            accessibilityLabel="Tap to trigger test alert"
            label={"Primary button (disabled)"}
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>
        {!isDesignSystemEnabled && (
          <>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                small
                disabled={true}
                fullWidth
                accessibilityLabel="Tap to trigger test alert"
                label={"Primary button (small, full, disabled)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </>
        )}
      </DSComponentViewerBox>

      {!isDesignSystemEnabled && (
        <>
          <DSComponentViewerBox name="ButtonOutline · Neutral variant">
            <View>
              <ButtonOutline
                color="neutral"
                label={"Neutral button"}
                onPress={() => {
                  alert("Action triggered");
                }}
                accessibilityLabel="Tap to trigger test alert"
              />
            </View>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                small
                color="neutral"
                accessibilityLabel="Tap to trigger test alert"
                label={"Neutral button (small)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ButtonOutline · Neutral, full width">
            <View>
              <ButtonOutline
                fullWidth
                color="neutral"
                accessibilityLabel="Tap to trigger test alert"
                label={"Neutral button (full width)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                small
                fullWidth
                color="neutral"
                accessibilityLabel="Tap to trigger test alert"
                label={"Neutral button (small, full width)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox name="ButtonOutline · Neutral, disabled">
            <View>
              <ButtonOutline
                color="neutral"
                disabled
                accessibilityLabel="Tap to trigger test alert"
                label={"Neutral button (disabled)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                color="neutral"
                small
                disabled
                fullWidth
                accessibilityLabel="Tap to trigger test alert"
                label={"Neutral Button (small, full, disabled)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox name="ButtonOutline · Danger variant">
            <View>
              <ButtonOutline
                color="danger"
                label={"Danger button"}
                onPress={() => {
                  alert("Action triggered");
                }}
                accessibilityLabel="Tap to trigger test alert"
              />
            </View>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                small
                color="danger"
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger Button (Small)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ButtonOutline · Danger, full width">
            <View>
              <ButtonOutline
                fullWidth
                color="danger"
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger button (Full Width)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                small
                fullWidth
                color="danger"
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger Button (Small, Full Width)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </DSComponentViewerBox>

          <DSComponentViewerBox name="ButtonOutline · Danger, disabled">
            <View>
              <ButtonOutline
                color="danger"
                disabled
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger button (disabled)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
            <VSpacer size={16} />
            <View>
              <ButtonOutline
                color="danger"
                small
                disabled
                fullWidth
                accessibilityLabel="Tap to trigger test alert"
                label={"Danger Button (small, full, disabled)"}
                onPress={() => {
                  alert("Action triggered");
                }}
              />
            </View>
          </DSComponentViewerBox>
        </>
      )}

      <View
        style={
          isDesignSystemEnabled
            ? styles.primaryBlock
            : styles.primaryBlockLegacy
        }
      >
        <DSComponentViewerBox
          name="ButtonOutline · Contrast variant"
          colorMode="dark"
        >
          <View>
            <ButtonOutline
              color="contrast"
              label={"Contrast button"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </View>
          {!isDesignSystemEnabled && (
            <>
              <VSpacer size={16} />
              <View>
                <ButtonOutline
                  small
                  color="contrast"
                  accessibilityLabel="Tap to trigger test alert"
                  label={"Contrast button (small)"}
                  onPress={onButtonPress}
                />
              </View>
            </>
          )}
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonOutline · Contrast, full width"
          colorMode="dark"
        >
          <View>
            <ButtonOutline
              fullWidth
              color="contrast"
              label={"Contrast button"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </View>
          {!isDesignSystemEnabled && (
            <>
              <VSpacer size={16} />
              <View>
                <ButtonOutline
                  small
                  fullWidth
                  color="contrast"
                  accessibilityLabel="Tap to trigger test alert"
                  label={"Contrast button (small)"}
                  onPress={onButtonPress}
                />
              </View>
            </>
          )}
        </DSComponentViewerBox>

        <DSComponentViewerBox
          name="ButtonOutline · Contrast, disabled"
          colorMode="dark"
          last
        >
          <View>
            <ButtonOutline
              disabled
              color="contrast"
              label={"Contrast button, disabled"}
              onPress={onButtonPress}
              accessibilityLabel="Tap to trigger test alert"
            />
          </View>
          {!isDesignSystemEnabled && (
            <>
              <VSpacer size={16} />
              <View>
                <ButtonOutline
                  small
                  fullWidth
                  disabled
                  color="contrast"
                  accessibilityLabel="Tap to trigger test alert"
                  label={"Contrast button (small, full, disabled)"}
                  onPress={onButtonPress}
                />
              </View>
            </>
          )}
        </DSComponentViewerBox>
      </View>

      <VSpacer size={40} />

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        IconButton
      </H2>
      <DSComponentViewerBox name="IconButton · Primary Variant (using Pressable API)">
        <View style={IOStyles.row}>
          <IconButton
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            onPress={() => {
              alert("Action triggered");
            }}
          />

          <HSpacer size={16} />

          <IconButton
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            disabled
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>
      </DSComponentViewerBox>

      <DSComponentViewerBox name="IconButton · Neutral Variant, small">
        <View style={IOStyles.row}>
          <IconButton
            color="neutral"
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            onPress={() => {
              alert("Action triggered");
            }}
          />

          <HSpacer size={16} />

          <IconButton
            color="neutral"
            accessibilityLabel="Tap to trigger test alert"
            icon="help"
            disabled
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>
      </DSComponentViewerBox>

      <View
        style={
          isDesignSystemEnabled
            ? styles.primaryBlock
            : styles.primaryBlockLegacy
        }
      >
        <DSComponentViewerBox
          name="IconButton · Neutral Variant, small"
          colorMode="dark"
          last
        >
          <View style={IOStyles.row}>
            <IconButton
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              icon="help"
              onPress={onButtonPress}
            />

            <HSpacer size={16} />

            <IconButton
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              icon="help"
              disabled
              onPress={onButtonPress}
            />
          </View>
        </DSComponentViewerBox>
      </View>

      <VSpacer size={40} />

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        IconButtonSolid
      </H2>

      <DSComponentViewerBox name="IconButtonSolid · Primary variant, large">
        <View style={IOStyles.row}>
          <IconButtonSolid
            color="primary"
            accessibilityLabel="Tap to trigger test alert"
            icon="arrowBottom"
            onPress={() => {
              alert("Action triggered");
            }}
          />

          <HSpacer size={16} />

          <IconButtonSolid
            color="primary"
            accessibilityLabel="Tap to trigger test alert"
            icon="arrowBottom"
            disabled
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>
      </DSComponentViewerBox>

      <View
        style={
          isDesignSystemEnabled
            ? styles.primaryBlock
            : styles.primaryBlockLegacy
        }
      >
        <DSComponentViewerBox
          name="IconButton · Contrast variant, large"
          colorMode="dark"
          last
        >
          <View style={IOStyles.row}>
            <IconButtonSolid
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              icon="arrowBottom"
              onPress={onButtonPress}
            />

            <HSpacer size={16} />

            <IconButtonSolid
              color="contrast"
              accessibilityLabel="Tap to trigger test alert"
              icon="arrowBottom"
              disabled
              onPress={onButtonPress}
            />
          </View>
        </DSComponentViewerBox>
      </View>

      <VSpacer size={40} />

      <DSComponentViewerBox name="ButtonExtendedOutline (using Pressable API)">
        <View>
          <ButtonExtendedOutline
            label={"Label name"}
            description={"This is a description of the element"}
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>
        <VSpacer size={16} />
        <View>
          <ButtonExtendedOutline
            icon="chevronRight"
            label={"Label only"}
            onPress={() => {
              alert("Action triggered");
            }}
          />
        </View>
      </DSComponentViewerBox>

      <VSpacer size={24} />

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        Block Buttons (NativeBase)
      </H2>

      <BlockButtons
        type="SingleButton"
        leftButton={{
          block: true,
          primary: true,
          title: "Primary button"
        }}
      />
      <VSpacer size={16} />

      <BlockButtons
        type="TwoButtonsInlineThird"
        leftButton={{ bordered: true, primary: true, title: "Left button" }}
        rightButton={{
          block: true,
          primary: true,
          title: "Right button"
        }}
      />

      <VSpacer size={16} />

      <BlockButtons
        type="TwoButtonsInlineHalf"
        leftButton={{ bordered: true, primary: true, title: "Left button" }}
        rightButton={{
          block: true,
          primary: true,
          title: "Right button"
        }}
      />

      <VSpacer size={16} />
      <BlockButtons
        type="TwoButtonsInlineThirdInverted"
        leftButton={{ bordered: true, primary: true, title: "Left button" }}
        rightButton={{
          block: true,
          primary: true,
          title: "Right button"
        }}
      />

      <VSpacer size={16} />
      <BlockButtons
        type="ThreeButtonsInLine"
        leftButton={{ alert: true, title: "Left button" }}
        midButton={{ bordered: true, title: "Middle" }}
        rightButton={{
          block: true,
          primary: true,
          title: "Right button"
        }}
      />

      <VSpacer size={24} />

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginBottom: 16, marginTop: 16 }}
      >
        Specific buttons
      </H2>
      <DSComponentViewerBox name="ViewEUCovidButton">
        <ViewEUCovidButton
          onPress={() => {
            alert("Covid Certificate shown");
          }}
        />
      </DSComponentViewerBox>

      <DSComponentViewerBox name="PaymentButton">
        <PaymentButton
          amount={9999999999}
          noticeNumber={"123112312312321321" as PaymentNoticeNumber}
          organizationFiscalCode={"46545" as OrganizationFiscalCode}
        />
      </DSComponentViewerBox>

      <DSComponentViewerBox name="CalendarEventButton">
        <ButtonDefaultOpacity small={true} bordered={true}>
          <IconFont name={"io-plus"} />
          <NBText>Aggiungi promemoria</NBText>
        </ButtonDefaultOpacity>
        <VSpacer size={16} />
        <ButtonDefaultOpacity small={true} bordered={true}>
          <IconFont name={"io-tick-big"} />
          <NBText>Aggiunto</NBText>
        </ButtonDefaultOpacity>
      </DSComponentViewerBox>

      <DSComponentViewerBox name="CopyButtonComponent">
        <CopyButtonComponent textToCopy={"Copied text by CopyButton"} />
      </DSComponentViewerBox>

      {/* 
      The following components are using the legacy `IconFont`
      component because replacing assets isn't the aim of
      the buttons' inventory.
      Future Button components, preferrably not based
      on NativeBase, must use the new <Icon> component.
    */}

      <DSComponentViewerBox name="Login buttons">
        <ButtonDefaultOpacity block={true} primary={true}>
          <IconFont name={"io-profilo"} color={IOColors.white} />
          <NBText>Entra con SPID</NBText>
        </ButtonDefaultOpacity>
        <VSpacer size={16} />
        <ButtonDefaultOpacity block={true} primary={true}>
          <IconFont name={"io-cie"} color={IOColors.white} />
          <NBText>Entra con CIE</NBText>
        </ButtonDefaultOpacity>
      </DSComponentViewerBox>
    </DesignSystemScreen>
  );
};
