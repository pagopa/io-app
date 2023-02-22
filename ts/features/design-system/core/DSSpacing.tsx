import * as React from "react";
import { View, StyleSheet } from "react-native";

import { H2 } from "../../../components/core/typography/H2";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { DSSpacerViewerBox } from "../components/DSSpacerViewerBox";
import {
  IOSpacer,
  IOContentWrapper
} from "../../../components/core/variables/IOSpacing";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import { Body } from "../../../components/core/typography/Body";
import { IOColors } from "../../../components/core/variables/IOColors";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";

const styles = StyleSheet.create({
  debugComponent: {
    backgroundColor: IOColors.grey200
  },
  contentWrapperBg: {
    backgroundColor: IOColors.grey50,
    paddingVertical: 16
  }
});

export const DSSpacing = () => (
  <DesignSystemScreen title={"Spacing"} noMargin>
    <ContentWrapper>
      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginTop: 32, marginBottom: 16 }}
      >
        ContentWrapper
      </H2>
    </ContentWrapper>
    {IOContentWrapper.map((value, i, arr) => (
      <React.Fragment key={`${value}-${i}`}>
        <View style={styles.debugComponent}>
          <ContentWrapper margin={value}>
            <View style={styles.contentWrapperBg}>
              <Body>Content example</Body>
              <LabelSmall
                style={{ position: "absolute", right: 4, top: 4 }}
                fontSize="small"
                weight="Regular"
                color="grey700"
              >
                {value}
              </LabelSmall>
            </View>
          </ContentWrapper>
        </View>
        {i !== arr.length - 1 && <VSpacer size={16} />}
      </React.Fragment>
    ))}

    <ContentWrapper>
      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginTop: 32, marginBottom: 16 }}
      >
        VSpacer
      </H2>

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

      <H2
        color={"bluegrey"}
        weight={"SemiBold"}
        style={{ marginTop: 32, marginBottom: 16 }}
      >
        HSpacer
      </H2>

      {/* Horizontal */}
      <View style={{ flexDirection: "row" }}>
        {IOSpacer.map((spacerEntry, i, arr) => (
          <React.Fragment key={`${spacerEntry}-${i}-horizontal`}>
            <DSSpacerViewerBox orientation="horizontal" size={spacerEntry} />
            {i !== arr.length - 1 && <HSpacer size={8} />}
          </React.Fragment>
        ))}
      </View>

      <VSpacer size={48} />
    </ContentWrapper>
  </DesignSystemScreen>
);
