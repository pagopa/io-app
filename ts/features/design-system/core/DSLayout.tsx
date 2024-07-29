import {
  ContentWrapper,
  Divider,
  HStack,
  IOAppMargin,
  IOColors,
  IOSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { H1 } from "../../../components/core/typography/H1";
import { H3 } from "../../../components/core/typography/H3";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DSSpacerViewerBox } from "../components/DSSpacerViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLayout = () => {
  const sectionMargin = 40;

  return (
    <DesignSystemScreen title={"Layout"} noMargin>
      <VStack space={sectionMargin}>
        <Grid />
        <Spacing />
        <Stack />
        <DividerRow />
      </VStack>
    </DesignSystemScreen>
  );
};

const Grid = () => {
  const theme = useIOTheme();

  return (
    <View>
      <ContentWrapper>
        <H1
          color={theme["textHeading-default"]}
          weight={"Bold"}
          style={{ marginBottom: 16 }}
        >
          Grid
        </H1>
        <H3
          color={theme["textHeading-default"]}
          weight={"Semibold"}
          style={{ marginBottom: 16 }}
        >
          ContentWrapper
        </H3>
      </ContentWrapper>

      <VStack space={16}>
        {IOAppMargin.map((value, i) => (
          <View
            key={`${value}-${i}`}
            style={{
              backgroundColor: IOColors[theme["appBackground-tertiary"]]
            }}
          >
            <ContentWrapper margin={value}>
              <View
                style={{
                  paddingVertical: 16,
                  backgroundColor: IOColors[theme["appBackground-secondary"]]
                }}
              >
                <Body color={theme["textBody-secondary"]}>Content example</Body>
                <LabelSmall
                  style={{ position: "absolute", right: 4, top: 4 }}
                  fontSize="small"
                  weight="Regular"
                  color={theme["textBody-tertiary"]}
                >
                  {value}
                </LabelSmall>
              </View>
            </ContentWrapper>
          </View>
        ))}
      </VStack>
    </View>
  );
};

const Spacing = () => {
  const theme = useIOTheme();

  return (
    <ContentWrapper>
      <H1
        color={theme["textHeading-default"]}
        weight={"Bold"}
        style={{ marginBottom: 16 }}
      >
        Spacing
      </H1>

      <VStack space={24}>
        {/* VSPACER */}
        <VStack space={16}>
          <H3 color={theme["textHeading-default"]} weight={"Semibold"}>
            VSpacer
          </H3>

          {/* Vertical */}
          <VStack space={16}>
            {IOSpacer.map((spacerEntry, i) => (
              <DSSpacerViewerBox
                key={`${spacerEntry}-${i}-vertical`}
                orientation="vertical"
                size={spacerEntry}
              />
            ))}
          </VStack>
        </VStack>

        {/* HSPACER */}
        <VStack space={16}>
          <H3 color={theme["textHeading-default"]} weight={"Semibold"}>
            HSpacer
          </H3>

          {/* Horizontal */}
          <HStack space={8}>
            {IOSpacer.map((spacerEntry, i) => (
              <DSSpacerViewerBox
                key={`${spacerEntry}-${i}-horizontal`}
                orientation="horizontal"
                size={spacerEntry}
              />
            ))}
          </HStack>
        </VStack>
      </VStack>
    </ContentWrapper>
  );
};

const Stack = () => {
  const theme = useIOTheme();

  return (
    <ContentWrapper>
      <H1
        color={theme["textHeading-default"]}
        weight={"Bold"}
        style={{ marginBottom: 16 }}
      >
        Stack
      </H1>

      <VStack space={24}>
        <VStack space={16}>
          <H3 color={theme["textHeading-default"]} weight={"Semibold"}>
            VStack
          </H3>

          <View>
            <DSComponentViewerBox name="VStack, space 16">
              <View
                style={{
                  backgroundColor: IOColors[theme["appBackground-secondary"]]
                }}
              >
                <VStack space={16}>
                  <VStackBlocks />
                </VStack>
              </View>
            </DSComponentViewerBox>

            {/* <DSComponentViewerBox name="VStack, space 16, centered">
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: IOColors[theme["appBackground-secondary"]]
            }}
          >
            <VStack space={16} style={{ alignItems: "center" }}>
              <VStackBlocks />
            </VStack>
          </View>
        </DSComponentViewerBox> */}
          </View>
        </VStack>

        <VStack space={16}>
          <H3 color={theme["textHeading-default"]} weight={"Semibold"}>
            HStack
          </H3>

          <DSComponentViewerBox name="HStack, space 16">
            <View
              style={{
                backgroundColor: IOColors[theme["appBackground-secondary"]]
              }}
            >
              <HStack space={16}>
                <HStackBlocks />
              </HStack>
            </View>
          </DSComponentViewerBox>

          {/* <DSComponentViewerBox name="HStack, space 16, centered">
          <View
            style={{
              backgroundColor: IOColors[theme["appBackground-secondary"]]
            }}
          >
            <HStack space={16} style={{ alignItems: "center" }}>
              <HStackBlocks />
            </HStack>
          </View>
        </DSComponentViewerBox> */}
        </VStack>
      </VStack>
    </ContentWrapper>
  );
};

const VStackBlocks = () => {
  const theme = useIOTheme();

  return (
    <>
      {[...Array(3)].map((_el, i) => (
        <View
          key={`block-${i}`}
          style={{
            height: 32,
            paddingHorizontal: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: IOColors[theme["appBackground-tertiary"]]
          }}
        >
          <LabelSmall
            weight="Regular"
            color={theme["textBody-tertiary"]}
          >{`Block n.${i + 1}`}</LabelSmall>
        </View>
      ))}
      <View
        style={{
          height: 72,
          paddingHorizontal: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: IOColors[theme["appBackground-tertiary"]]
        }}
      >
        <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
          Different height
        </LabelSmall>
      </View>
    </>
  );
};

const HStackBlocks = () => {
  const theme = useIOTheme();

  return (
    <>
      {[...Array(3)].map((_el, i) => (
        <View
          key={`block-${i}`}
          style={{
            width: 48,
            paddingVertical: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: IOColors[theme["appBackground-tertiary"]]
          }}
        >
          <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>{`${
            i + 1
          }`}</LabelSmall>
        </View>
      ))}
      <View
        style={{
          flexGrow: 1,
          paddingVertical: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: IOColors[theme["appBackground-tertiary"]]
        }}
      >
        <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
          Growing block
        </LabelSmall>
      </View>
    </>
  );
};

const DividerRow = () => {
  const theme = useIOTheme();

  return (
    <>
      <ContentWrapper>
        <H1
          color={theme["textHeading-default"]}
          weight={"Bold"}
          style={{ marginBottom: 16 }}
        >
          Divider
        </H1>

        <H3
          color={theme["textHeading-default"]}
          weight={"Semibold"}
          style={{ marginBottom: 16 }}
        >
          Default (Horizontal)
        </H3>

        <Divider />
      </ContentWrapper>
      <Divider />
    </>
  );
};
