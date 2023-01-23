import { Text as NBButtonText } from "native-base";
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
import { ViewEUCovidButton } from "../../euCovidCert/components/ViewEUCovidButton";
import PaymentButton from "../../../components/messages/MessageDetail/common/PaymentButton";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import IconFont from "../../../components/ui/IconFont";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";

export const DSButtons = () => (
  <DesignSystemScreen title={"Buttons"}>
    {/* The title should be dynamic, got from the route object */}
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
          icon="arrowRight"
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
        <NBButtonText>Primary button</NBButtonText>
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
        <NBButtonText>Primary button (Block)</NBButtonText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Small)">
      <ButtonDefaultOpacity
        small={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBButtonText>Primary button (Small)</NBButtonText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase Button (XSmall)">
      <ButtonDefaultOpacity
        xsmall={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBButtonText>XSmall button</NBButtonText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Primary Disabled)">
      <ButtonDefaultOpacity
        disabled={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBButtonText>Primary button (Disabled)</NBButtonText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Outline)">
      <ButtonDefaultOpacity
        bordered={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBButtonText>Outline button (Light)</NBButtonText>
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
        <NBButtonText>Outline button (Block Light)</NBButtonText>
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
        <NBButtonText>Outline button (Small Light)</NBButtonText>
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
        <NBButtonText>Outline button (disabled)</NBButtonText>
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
        <NBButtonText>Outline button (light)</NBButtonText>
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
        <NBButtonText>Outline button (block light)</NBButtonText>
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
        <NBButtonText>Outline button (small light)</NBButtonText>
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
        <NBButtonText>Outline button (light disabled)</NBButtonText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="NativeBase ButtonDefaultOpacity (Dark)">
      <ButtonDefaultOpacity
        dark={true}
        onPress={() => {
          alert("Action triggered");
        }}
      >
        <NBButtonText>Primary button (dark)</NBButtonText>
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
        <NBButtonText>Outline button (dark)</NBButtonText>
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
        <NBButtonText>Button (light text)</NBButtonText>
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
        <NBButtonText>Aggiungi promemoria</NBButtonText>
      </ButtonDefaultOpacity>
      <VSpacer size={16} />
      <ButtonDefaultOpacity small={true} bordered={true}>
        <IconFont name={"io-tick-big"} />
        <NBButtonText>Aggiunto</NBButtonText>
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
        <NBButtonText>Entra con SPID</NBButtonText>
      </ButtonDefaultOpacity>
      <VSpacer size={16} />
      <ButtonDefaultOpacity block={true} primary={true}>
        <IconFont name={"io-cie"} color={IOColors.white} />
        <NBButtonText>Entra con CIE</NBButtonText>
      </ButtonDefaultOpacity>
    </DSComponentViewerBox>
  </DesignSystemScreen>
);
