import { View as NBView, Text as NBText } from "native-base";
import { View } from "react-native";
import * as React from "react";
import { ButtonExtendedOutline } from "../../components/ui/ButtonExtendedOutline";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { H2 } from "../../components/core/typography/H2";
import { IOColors } from "../../components/core/variables/IOColors";
import { LabelSmall } from "../../components/core/typography/LabelSmall";
import { Label } from "../../components/core/typography/Label";
import GoBackButton from "../../components/GoBackButton";
import { ShowroomSection } from "./components/ShowroomSection";
import { ComponentViewerBox } from "./components/ComponentViewerBox";

export const ButtonsShowroom = () => (
  <ShowroomSection title={"Buttons"}>
    <ComponentViewerBox name="ButtonExtendedOutline (using Pressable API)">
      <View>
        <ButtonExtendedOutline
          label={"Label name"}
          description={"This is a description of the element"}
          onPress={() => {
            alert("Action triggered");
          }}
        />
      </View>
      <NBView spacer={true} />
      <View>
        <ButtonExtendedOutline
          icon="arrowRight"
          label={"Label only"}
          onPress={() => {
            alert("Action triggered");
          }}
        />
      </View>
    </ComponentViewerBox>
    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      NativeBase
    </H2>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary)">
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
        <NBText>Primary Button</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Block)">
      <ButtonDefaultOpacity
        primary={true}
        block={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary Button (Block)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Small)">
      <ButtonDefaultOpacity
        small={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary Button (Small)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="NativeBase Button (XSmall)">
      <ButtonDefaultOpacity
        xsmall={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>XSmall Button</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Disabled)">
      <ButtonDefaultOpacity
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary Button (Disabled)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline)">
      <ButtonDefaultOpacity
        bordered={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Light)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Block)">
      <ButtonDefaultOpacity
        bordered={true}
        block={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Block Light)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Small)">
      <ButtonDefaultOpacity
        bordered={true}
        small={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Small Light)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Disabled)">
      <ButtonDefaultOpacity
        bordered={true}
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Disabled)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Light)">
      <ButtonDefaultOpacity
        bordered={true}
        light={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Light)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Block Light)">
      <ButtonDefaultOpacity
        bordered={true}
        block={true}
        light={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Block Light)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Small Light)">
      <ButtonDefaultOpacity
        bordered={true}
        small={true}
        light={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Small Light)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Light Disabled)">
      <ButtonDefaultOpacity
        bordered={true}
        light={true}
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Light Disabled)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Dark)">
      <ButtonDefaultOpacity
        dark={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary Button (Dark)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline Dark)">
      <ButtonDefaultOpacity
        dark={true}
        bordered={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline Button (Dark)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="NativeBase Button (Cancel) · Custom style, not managed by props">
      <ButtonDefaultOpacity
        bordered={true}
        style={{ borderColor: IOColors.red }}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"red"}>Cancel Outline Button</Label>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="NativeBase Button (Cancel)">
      <ButtonDefaultOpacity
        alert={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"white"}>Cancel Button</Label>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="NativeBase Button (Cancel Block)">
      <ButtonDefaultOpacity
        alert={true}
        block={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"white"}>Cancel Button (Block)</Label>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Light Text)">
      <ButtonDefaultOpacity
        lightText={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Button (Light Text)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <View
      style={{
        backgroundColor: IOColors.blue,
        padding: 16,
        borderRadius: 8
      }}
    >
      <ComponentViewerBox name="NativeBase Button (White)" colorMode="dark">
        <ButtonDefaultOpacity
          white={true}
          onPress={() => {
            alert("Action triggered");
          }}
        >
          <LabelSmall color={"bluegrey"} weight={"Bold"}>
            White Button
          </LabelSmall>
        </ButtonDefaultOpacity>
      </ComponentViewerBox>

      <ComponentViewerBox name="NativeBase Button (White)" colorMode="dark">
        <GoBackButton
          onPress={() => {
            alert("Going back");
          }}
          white={true}
        />
      </ComponentViewerBox>
    </View>
  </ShowroomSection>
);
