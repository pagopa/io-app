import { View as NBView, Text as NBText } from "native-base";
import { View } from "react-native";
import * as React from "react";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ButtonExtendedOutline } from "../../../components/ui/ButtonExtendedOutline";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { Label } from "../../../components/core/typography/Label";
import GoBackButton from "../../../components/GoBackButton";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
import BlockButtons from "../../../components/ui/BlockButtons";
import { ViewEUCovidButton } from "../../../features/euCovidCert/components/ViewEUCovidButton";
import PaymentButton from "../../../components/messages/MessageDetail/common/PaymentButton";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import IconFont from "../../../components/ui/IconFont";
import { ShowroomSection } from "../components/ShowroomSection";
import { ComponentViewerBox } from "../components/ComponentViewerBox";

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
        <NBText>Primary button</NBText>
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
        <NBText>Primary button (Block)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Small)">
      <ButtonDefaultOpacity
        small={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button (Small)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase Button (XSmall)">
      <ButtonDefaultOpacity
        xsmall={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>XSmall button</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Disabled)">
      <ButtonDefaultOpacity
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button (Disabled)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline)">
      <ButtonDefaultOpacity
        bordered={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Outline button (Light)</NBText>
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
        <NBText>Outline button (Block Light)</NBText>
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
        <NBText>Outline button (Small Light)</NBText>
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
        <NBText>Outline button (disabled)</NBText>
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
        <NBText>Outline button (light)</NBText>
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
        <NBText>Outline button (block light)</NBText>
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
        <NBText>Outline button (small light)</NBText>
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
        <NBText>Outline button (light disabled)</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Dark)">
      <ButtonDefaultOpacity
        dark={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Primary button (dark)</NBText>
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
        <NBText>Outline button (dark)</NBText>
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
        <Label color={"red"}>Cancel outline button</Label>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase Button (Cancel) · Custom style, not managed by props">
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
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase Button (Cancel)">
      <ButtonDefaultOpacity
        alert={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <Label color={"white"}>Cancel button</Label>
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
        <Label color={"white"}>Cancel button (block)</Label>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
    <ComponentViewerBox name="NativeBase ButtonDefaultOpacity (Light Text)">
      <ButtonDefaultOpacity
        lightText={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBText>Button (light text)</NBText>
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
            White button
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

    <NBView spacer={true} large={true} />

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
    <NBView spacer={true} />

    <BlockButtons
      type="TwoButtonsInlineThird"
      leftButton={{ bordered: true, primary: true, title: "Left button" }}
      rightButton={{
        block: true,
        primary: true,
        title: "Right button"
      }}
    />

    <NBView spacer={true} />

    <BlockButtons
      type="TwoButtonsInlineHalf"
      leftButton={{ bordered: true, primary: true, title: "Left button" }}
      rightButton={{
        block: true,
        primary: true,
        title: "Right button"
      }}
    />

    <NBView spacer={true} />
    <BlockButtons
      type="TwoButtonsInlineThirdInverted"
      leftButton={{ bordered: true, primary: true, title: "Left button" }}
      rightButton={{
        block: true,
        primary: true,
        title: "Right button"
      }}
    />

    <NBView spacer={true} />
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

    <NBView spacer={true} large={true} />

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      Specific buttons
    </H2>
    <ComponentViewerBox name="ViewEUCovidButton">
      <ViewEUCovidButton
        onPress={() => {
          alert("Covid Certificate shown");
        }}
      />
    </ComponentViewerBox>

    <ComponentViewerBox name="PaymentButton">
      <PaymentButton
        amount={9999999999}
        noticeNumber={"123112312312321321" as PaymentNoticeNumber}
        organizationFiscalCode={"46545" as OrganizationFiscalCode}
      />
    </ComponentViewerBox>

    <ComponentViewerBox name="CalendarEventButton">
      <ButtonDefaultOpacity small={true} bordered={true}>
        <IconFont name={"io-plus"} />
        <NBText>Aggiungi promemoria</NBText>
      </ButtonDefaultOpacity>
      <NBView spacer={true} />
      <ButtonDefaultOpacity small={true} bordered={true}>
        <IconFont name={"io-tick-big"} />
        <NBText>Aggiunto</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>

    <ComponentViewerBox name="CopyButtonComponent">
      <CopyButtonComponent textToCopy={"Copied text by CopyButton"} />
    </ComponentViewerBox>

    {/* 
      The following components are using the legacy `IconFont`
      component because replacing assets isn't the aim of
      the buttons' inventory.
      Future Button components, preferrably not based
      on NativeBase, must use the new <Icon> component.
    */}

    <ComponentViewerBox name="Login buttons">
      <ButtonDefaultOpacity block={true} primary={true}>
        <IconFont name={"io-profilo"} color={IOColors.white} />
        <NBText>Entra con SPID</NBText>
      </ButtonDefaultOpacity>
      <NBView spacer={true} />
      <ButtonDefaultOpacity block={true} primary={true}>
        <IconFont name={"io-cie"} color={IOColors.white} />
        <NBText>Entra con CIE</NBText>
      </ButtonDefaultOpacity>
    </ComponentViewerBox>
  </ShowroomSection>
);
