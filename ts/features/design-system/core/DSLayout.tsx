import * as React from "react";
import { View } from "react-native";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { DSSpacerViewerBox } from "../components/DSSpacerViewerBox";
import {
  IOAppMargin,
  IOSpacer
} from "../../../components/core/variables/IOSpacing";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import { Body } from "../../../components/core/typography/Body";
import {
  IOColors,
  IOThemeContext
} from "../../../components/core/variables/IOColors";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { H3 } from "../../../components/core/typography/H3";
import { H1 } from "../../../components/core/typography/H1";
import { Divider, VDivider } from "../../../components/core/Divider";

export const DSLayout = () => (
  <IOThemeContext.Consumer>
    {theme => (
      <DesignSystemScreen title={"Layout"} noMargin>
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
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            ContentWrapper
          </H3>
        </ContentWrapper>
        {IOAppMargin.map((value, i, arr) => (
          <React.Fragment key={`${value}-${i}`}>
            <View
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
                  <Body color={theme["textBody-secondary"]}>
                    Content example
                  </Body>
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
            {i !== arr.length - 1 && <VSpacer size={16} />}
          </React.Fragment>
        ))}

        <VSpacer size={40} />

        <ContentWrapper>
          <H1
            color={theme["textHeading-default"]}
            weight={"Bold"}
            style={{ marginBottom: 16 }}
          >
            Spacing
          </H1>

          <H3
            color={theme["textHeading-default"]}
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            VSpacer
          </H3>

          {/* Vertical */}
          {IOSpacer.map((spacerEntry, i, arr) => (
            <React.Fragment key={`${spacerEntry}-${i}-vertical`}>
              <DSSpacerViewerBox orientation="vertical" size={spacerEntry} />
              {/* Don't add spacer to the last item. Quick and dirty
        alternative to the Stack component.
        https://stackoverflow.com/a/60975451 */}
              {i !== arr.length - 1 && <VSpacer size={16} />}
            </React.Fragment>
          ))}

          <VSpacer size={24} />

          <H3
            color={theme["textHeading-default"]}
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            HSpacer
          </H3>

          {/* Horizontal */}
          <View style={{ flexDirection: "row" }}>
            {IOSpacer.map((spacerEntry, i, arr) => (
              <React.Fragment key={`${spacerEntry}-${i}-horizontal`}>
                <DSSpacerViewerBox
                  orientation="horizontal"
                  size={spacerEntry}
                />
                {i !== arr.length - 1 && <HSpacer size={8} />}
              </React.Fragment>
            ))}
          </View>

          <VSpacer size={48} />
        </ContentWrapper>

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
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            Default (Horizontal)
          </H3>

          <Divider />
          <VSpacer size={48} />
        </ContentWrapper>
        <Divider />
        <VSpacer size={48} />

        <ContentWrapper>
          <H3
            color={theme["textHeading-default"]}
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            Vertical
          </H3>

          <View style={{ flexDirection: "row", height: 100 }}>
            <VDivider />
          </View>
          <VSpacer size={48} />
        </ContentWrapper>
      </DesignSystemScreen>
    )}
  </IOThemeContext.Consumer>
);
