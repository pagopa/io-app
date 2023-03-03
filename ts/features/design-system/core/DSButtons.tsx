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
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { Label } from "../../../components/core/typography/Label";
import GoBackButton from "../../../components/GoBackButton";
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

const styles = StyleSheet.create({
  primaryBlock: {
    backgroundColor: IOColors.blue,
    padding: 16,
    borderRadius: 8
  }
});

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSButtons = () => (
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
      <View>
        <ButtonSolid
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          onPress={onButtonPress}
        />
      </View>
      <VSpacer size={16} />
      <View>
        <ButtonSolid
          small
          label={"Primary Button (Small)"}
          accessibilityLabel="Tap to trigger test alert"
          onPress={onButtonPress}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonSolid · Primary, Full width">
      <View>
        <ButtonSolid
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (Full Width)"}
          onPress={onButtonPress}
        />
      </View>
      <VSpacer size={16} />
      <View>
        <ButtonSolid
          small
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary Button (Small, Full Width)"}
          onPress={onButtonPress}
        />
      </View>
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
      <VSpacer size={16} />
      <View>
        <ButtonSolid
          small
          disabled={true}
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary Button (small, full, disabled)"}
          onPress={onButtonPress}
        />
      </View>
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
      <VSpacer size={16} />
      <View>
        <ButtonSolid
          small
          color="danger"
          accessibilityLabel="Tap to trigger test alert"
          label={"Danger Button (Small)"}
          onPress={onButtonPress}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonSolid · Danger, full width">
      <View>
        <ButtonSolid
          fullWidth
          color="danger"
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (Full Width)"}
          onPress={onButtonPress}
        />
      </View>
      <VSpacer size={16} />
      <View>
        <ButtonSolid
          small
          fullWidth
          color="danger"
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary Button (Small, Full Width)"}
          onPress={onButtonPress}
        />
      </View>
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
    </DSComponentViewerBox>

    <View style={styles.primaryBlock}>
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
        <VSpacer size={16} />
        <View>
          <ButtonSolid
            small
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            label={"Contrast button (Small)"}
            onPress={onButtonPress}
          />
        </View>
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
        <VSpacer size={16} />
        <View>
          <ButtonSolid
            small
            fullWidth
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            label={"Contrast button (Small)"}
            onPress={onButtonPress}
          />
        </View>
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
            label={"Contrast button, disabled"}
            onPress={onButtonPress}
            accessibilityLabel="Tap to trigger test alert"
          />
        </View>
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
    <DSComponentViewerBox name="ButtonOutline · Primary Variant (using Pressable API)">
      <View>
        <ButtonOutline
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button"}
          onPress={() => {
            alert("Action triggered");
          }}
        />
      </View>
      <VSpacer size={16} />
      <View>
        <ButtonOutline
          small
          label={"Primary Button (Small)"}
          accessibilityLabel="Tap to trigger test alert"
          onPress={() => {
            alert("Action triggered");
          }}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ButtonOutline · Primary, Full width">
      <View>
        <ButtonOutline
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary button (Full Width)"}
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
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary Button (Small, Full Width)"}
          onPress={() => {
            alert("Action triggered");
          }}
        />
      </View>
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
      <VSpacer size={16} />
      <View>
        <ButtonOutline
          small
          disabled={true}
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Primary Button (small, full, disabled)"}
          onPress={() => {
            alert("Action triggered");
          }}
        />
      </View>
    </DSComponentViewerBox>

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
          label={"Neutral Button (Small)"}
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
          label={"Neutral button (Full Width)"}
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
          label={"Neutral Button (Small, Full Width)"}
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

    <View style={styles.primaryBlock}>
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
        <VSpacer size={16} />
        <View>
          <ButtonOutline
            small
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            label={"Contrast button (Small)"}
            onPress={onButtonPress}
          />
        </View>
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
        <VSpacer size={16} />
        <View>
          <ButtonOutline
            small
            fullWidth
            color="contrast"
            accessibilityLabel="Tap to trigger test alert"
            label={"Contrast button (Small)"}
            onPress={onButtonPress}
          />
        </View>
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

    <View style={styles.primaryBlock}>
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

    <View style={styles.primaryBlock}>
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
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      NativeBase
    </H2>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary)">
      {/* The following props render the button with the same
              graphical attributes:
                  - Active
                  - Input Button
            */}
      <ButtonDefaultOpacity
        primary={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Block)">
      <ButtonDefaultOpacity
        primary={true}
        block={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button (Block)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Small)">
      <ButtonDefaultOpacity
        small={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button (Small)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase Button (XSmall)">
      <ButtonDefaultOpacity
        xsmall={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>XSmall button</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Disabled)">
      <ButtonDefaultOpacity
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button (Disabled)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline)">
      <ButtonDefaultOpacity
        bordered={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (Light)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Block)">
      <ButtonDefaultOpacity
        bordered={true}
        block={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (Block Light)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Small)">
      <ButtonDefaultOpacity
        bordered={true}
        small={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (Small Light)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Disabled)">
      <ButtonDefaultOpacity
        bordered={true}
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (disabled)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Light)">
      <ButtonDefaultOpacity
        bordered={true}
        light={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (light)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Block Light)">
      <ButtonDefaultOpacity
        bordered={true}
        block={true}
        light={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (block light)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Small Light)">
      <ButtonDefaultOpacity
        bordered={true}
        small={true}
        light={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (small light)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Light Disabled)">
      <ButtonDefaultOpacity
        bordered={true}
        light={true}
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (light disabled)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Dark)">
      <ButtonDefaultOpacity
        dark={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button (dark)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Dark)">
      <ButtonDefaultOpacity
        dark={true}
        bordered={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (dark)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase Button (Cancel) · Custom style, not managed by props">
      <ButtonDefaultOpacity
        bordered={true}
        style={{ borderColor: IOColors.red }}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"red"}>Cancel outline button</Label>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase Button (Cancel) · Custom style, not managed by props">
      <ButtonDefaultOpacity
        bordered={true}
        block={true}
        style={{ borderColor: IOColors.red }}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"red"}>Cancel outline button (block)</Label>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase Button (Cancel)">
      <ButtonDefaultOpacity
        alert={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"white"}>Cancel button</Label>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase Button (Cancel Block)">
      <ButtonDefaultOpacity
        alert={true}
        block={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"white"}>Cancel button (block)</Label>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Light Text)">
      <ButtonDefaultOpacity
        lightText={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Button (light text)</NBText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <View
      style={{
        backgroundColor: IOColors.blue,
        padding: 16,
        borderRadius: 8
      }}
    >
      <DSComponentViewerBox name="NativeBase Button (White)" colorMode="dark">
        <ButtonDefaultOpacity
          white={true}
          onPress={() => {
            alert("Action triggered");
          }}
        >
          <LabelSmall color={"bluegrey"} weight={"Bold"}>
            White button
          </LabelSmall>
        </ButtonDefaultOpacity>
      </DSComponentViewerBox>

      <DSComponentViewerBox name="NativeBase Button (White)" colorMode="dark">
        <GoBackButton
          onPress={() => {
            alert("Going back");
          }}
          white={true}
        />
      </DSComponentViewerBox>
    </View>

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
