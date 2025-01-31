import { HStack, IOText, Tag } from "@pagopa/io-app-design-system";
import Color from "color";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  getCredentialNameFromType,
  tagPropsByStatus,
  useBorderColorByStatus,
  validCredentialStatuses
} from "../../utils/itwCredentialUtils";
import { getThemeColorByCredentialType } from "../../utils/itwStyleUtils";
import { ItwCredentialStatus } from "../../utils/itwTypesUtils";
import { ItwDigitalVersionBadge } from "./ItwDigitalVersionBadge";
import { CardBackground } from "./CardBackground";
import { CardColorScheme } from "./types";

export type ItwCredentialCard = {
  credentialType: string;
  status?: ItwCredentialStatus;
};

type StyleProps = {
  titleColor: string;
  titleOpacity: number;
  colorScheme: CardColorScheme;
};

export const ItwCredentialCard = ({
  status = "valid",
  credentialType
}: ItwCredentialCard) => {
  const borderColorMap = useBorderColorByStatus();
  const statusTagProps = tagPropsByStatus[status];

  const { titleColor, titleOpacity, colorScheme } = useMemo<StyleProps>(() => {
    const isValid = validCredentialStatuses.includes(status);
    const theme = getThemeColorByCredentialType(credentialType);

    if (status === "unknown") {
      return {
        titleColor: Color(theme.textColor).grayscale().hex(),
        titleOpacity: 0.5,
        colorScheme: "greyscale"
      };
    }

    if (isValid) {
      return {
        titleColor: theme.textColor,
        titleOpacity: 1,
        colorScheme: "default"
      };
    }

    return {
      titleColor: theme.textColor,
      titleOpacity: 0.5,
      colorScheme: "faded"
    };
  }, [credentialType, status]);

  return (
    <View style={styles.cardContainer}>
      <CardBackground
        credentialType={credentialType}
        colorScheme={colorScheme}
      />
      <View style={styles.header}>
        <HStack space={16}>
          <IOText
            size={16}
            lineHeight={20}
            font="TitilliumSansPro"
            weight="Semibold"
            maxFontSizeMultiplier={1.25}
            style={{
              letterSpacing: 0.25,
              color: titleColor,
              opacity: titleOpacity,
              flex: 1,
              flexShrink: 1
            }}
          >
            {getCredentialNameFromType(credentialType, "").toUpperCase()}
          </IOText>
          {statusTagProps && <Tag forceLightMode {...statusTagProps} />}
        </HStack>
      </View>
      <ItwDigitalVersionBadge
        credentialType={credentialType}
        colorScheme={colorScheme}
      />
      <View style={[styles.border, { borderColor: borderColorMap[status] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: "hidden"
  },
  border: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    borderCurve: "continuous",
    borderWidth: 2,
    zIndex: 11
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14
  }
});
