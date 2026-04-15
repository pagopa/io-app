import {
  Body,
  BodySmall,
  ContentWrapper,
  Divider,
  H2,
  H6,
  HStack,
  IOAppMargin,
  IOColors,
  IOSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
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
        <H2 style={{ marginBottom: 16 }}>Grid</H2>
        <H6 style={{ marginBottom: 16 }}>ContentWrapper</H6>
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
                <BodySmall
                  style={{ position: "absolute", right: 4, top: 4 }}
                  weight="Regular"
                  color={theme["textBody-tertiary"]}
                >
                  {value}
                </BodySmall>
              </View>
            </ContentWrapper>
          </View>
        ))}
      </VStack>
    </View>
  );
};

const Spacing = () => (
  <ContentWrapper>
    <H2 style={{ marginBottom: 16 }}>Spacing</H2>

    <VStack space={24}>
      {/* VSPACER */}
      <VStack space={16}>
        <H6>VSpacer</H6>

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
        <H6>HSpacer</H6>

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

const Stack = () => {
  const theme = useIOTheme();

  return (
    <ContentWrapper>
      <H2 color={theme["textHeading-default"]} style={{ marginBottom: 16 }}>
        Stack
      </H2>

      <VStack space={24}>
        <VStack space={16}>
          <H6>VStack</H6>

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
          <H6>HStack</H6>

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
          <BodySmall
            weight="Regular"
            color={theme["textBody-tertiary"]}
          >{`Block n.${i + 1}`}</BodySmall>
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
        <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
          Different height
        </BodySmall>
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
          <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>{`${
            i + 1
          }`}</BodySmall>
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
        <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
          Growing block
        </BodySmall>
      </View>
    </>
  );
};

const DividerRow = () => (
  <>
    <ContentWrapper>
      <H2 style={{ marginBottom: 16 }}>Divider</H2>

      <H6 style={{ marginBottom: 16 }}>Default (Horizontal)</H6>

      <Divider />
    </ContentWrapper>
    <Divider />
  </>
);
