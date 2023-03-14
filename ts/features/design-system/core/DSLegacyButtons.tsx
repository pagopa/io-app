import * as React from "react";
import { View } from "react-native";
import { Text as NBText } from "native-base";
import { H2 } from "../../../components/core/typography/H2";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { IOColors } from "../../../components/core/variables/IOColors";
import { Label } from "../../../components/core/typography/Label";
import GoBackButton from "../../../components/GoBackButton";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { VSpacer } from "../../../components/core/spacer/Spacer";

export const DSLegacyButtons = () => (
  <DesignSystemScreen title={"Legacy Buttons"}>
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
  </DesignSystemScreen>
);
