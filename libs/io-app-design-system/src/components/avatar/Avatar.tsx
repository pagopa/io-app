import { ComponentProps, memo, useRef, useState } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import { Icon } from "../../components/icons";
import { useIOTheme } from "../../context";
import {
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  hexToRgba
} from "../../core";
import { addCacheTimestampToUri } from "../../utils/image";
import avatarSearchPlaceholder from "./placeholder/avatar-placeholder.png";

type Avatar = {
  size: "small" | "medium";
  logoUri?: ImageSourcePropType;
};

const internalSpaceDefaultSize: number = 6;
const internalSpaceLargeSize: number = 9;
const internalSpacePlaceholderDefaultSize: IOSpacingScale = 12;
const internalSpacePlaceholderLargeSize: IOSpacingScale = 16;
const avatarBorderLightMode = hexToRgba(IOColors.black, 0.1);

const dimensionsMap = {
  small: {
    size: IOVisualCostants.avatarSizeSmall,
    internalSpace: internalSpaceDefaultSize,
    internalSpacePlaceholder: internalSpacePlaceholderDefaultSize,
    radius: IOVisualCostants.avatarRadiusSizeSmall
  },
  medium: {
    size: IOVisualCostants.avatarSizeMedium,
    internalSpace: internalSpaceLargeSize,
    internalSpacePlaceholder: internalSpacePlaceholderLargeSize,
    radius: IOVisualCostants.avatarRadiusSizeMedium
  }
};

const styles = StyleSheet.create({
  avatarWrapper: {
    overflow: "hidden",
    borderColor: avatarBorderLightMode,
    borderWidth: 1,
    borderCurve: "continuous"
  },
  avatarInnerWrapper: {
    overflow: "hidden",
    backgroundColor: IOColors.white,
    borderCurve: "continuous"
  },
  avatarImage: {
    resizeMode: "contain",
    height: "100%",
    width: "100%"
  }
});

/**
 * Avatar component is used to display the logo of an organization. It accepts the following props:
 * - `logoUri`: the uri of the image to display. If not provided, a placeholder icon will be displayed. It can be a single uri or an array of uris, in which case the first one that is available will be used.
 * - `shape`: the shape of the avatar, can be "circle" or "square"
 * - `size`: the size of the avatar, can be "small" or "medium"
 * @param AvatarProps
 * @returns
 */
export const Avatar = ({ logoUri, size }: Avatar) => {
  const theme = useIOTheme();
  const indexValue = useRef<number>(0);

  const [imageSource, setImageSource] = useState(
    logoUri === undefined ? undefined : addCacheTimestampToUri(logoUri)
  );

  const onError = () => {
    if (Array.isArray(logoUri) && indexValue.current + 1 < logoUri.length) {
      // eslint-disable-next-line functional/immutable-data
      indexValue.current = indexValue.current + 1;
      setImageSource(addCacheTimestampToUri(logoUri[indexValue.current]));
      return;
    }
    setImageSource(undefined);
  };

  return (
    <View
      accessibilityIgnoresInvertColors
      style={[
        styles.avatarWrapper,
        {
          height: dimensionsMap[size].size,
          width: dimensionsMap[size].size,
          borderRadius: dimensionsMap[size].radius,
          backgroundColor:
            imageSource === undefined ? IOColors["grey-50"] : IOColors.white,
          padding:
            imageSource === undefined
              ? dimensionsMap[size].internalSpacePlaceholder
              : dimensionsMap[size].internalSpace
        }
      ]}
    >
      {imageSource === undefined ? (
        <Icon
          name="institution"
          color={theme["icon-decorative"]}
          size={"100%"}
        />
      ) : (
        <View
          style={[
            styles.avatarInnerWrapper,
            {
              borderRadius:
                dimensionsMap[size].radius - dimensionsMap[size].internalSpace
            }
          ]}
        >
          <Image
            accessibilityIgnoresInvertColors
            source={imageSource}
            style={styles.avatarImage}
            onError={onError}
          />
        </View>
      )}
    </View>
  );
};

export type AvatarSearchProps = Pick<
  ComponentProps<typeof Image>,
  "source" | "defaultSource" | "onError"
>;

/**
 * AvatarSearch component is used to display the logo of an institution in the search results.
 * A placeholder is displayed if the logo is not available.
 * Note: On Android, the default source prop is ignored on debug builds.
 *
 * @param AvatarSearchProps
 * @returns
 */
export const AvatarSearch = memo(
  ({ defaultSource, source, onError }: AvatarSearchProps) => {
    // Visual attributes
    const avatarSize = dimensionsMap.small.size;
    const borderRadius = dimensionsMap.small.radius;
    const internalSpace = dimensionsMap.small.internalSpace;
    const innerRadius = borderRadius - internalSpace;
    const defaultPlaceholder = defaultSource ?? avatarSearchPlaceholder;

    return (
      <View
        accessibilityIgnoresInvertColors
        style={[
          styles.avatarWrapper,
          {
            borderRadius,
            height: avatarSize,
            width: avatarSize,
            backgroundColor: IOColors.white,
            padding: internalSpace
          }
        ]}
      >
        <View
          style={[styles.avatarInnerWrapper, { borderRadius: innerRadius }]}
        >
          {source === undefined ? (
            <Image
              accessibilityIgnoresInvertColors
              source={defaultPlaceholder}
              style={styles.avatarImage}
            />
          ) : (
            <Image
              accessibilityIgnoresInvertColors
              source={source}
              onError={onError}
              style={styles.avatarImage}
            />
          )}
        </View>
      </View>
    );
  }
);
