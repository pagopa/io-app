import { ComponentProps, memo, useRef, useState } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

import { Icon } from "../../components/icons";
import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
import { addCacheTimestampToUri } from "../../utils/image";
import avatarSearchPlaceholder from "./placeholder/avatar-placeholder.png";

type Avatar = {
  logoUri?: ImageSourcePropType;
  size: "medium" | "small";
};

const styles = StyleSheet.create({
  avatarWrapper: {
    overflow: "hidden",
    borderWidth: IODimensions.stroke.default,
    borderCurve: "continuous"
  },
  avatarInnerWrapper: {
    overflow: "hidden",
    borderCurve: "continuous"
  },
  avatarImage: {
    resizeMode: "contain",
    height: "100%",
    width: "100%"
  }
});

/**
 * Avatar component is used to display the logo of an organization. It accepts
 * the following props:
 *
 * - `logoUri`: the uri of the image to display. If not provided, a placeholder
 *   icon will be displayed. It can be a single uri or an array of uris, in
 *   which case the first one that is available will be used.
 * - `shape`: the shape of the avatar, can be "circle" or "square"
 * - `size`: the size of the avatar, can be "small" or "medium"
 *
 * @param AvatarProps
 * @returns
 */
export const Avatar = ({ logoUri, size }: Avatar) => {
  const avatarColors = useIOColors().component.avatar;
  const indexValue = useRef<number>(0);

  const [imageSource, setImageSource] = useState(
    logoUri === undefined ? undefined : addCacheTimestampToUri(logoUri)
  );

  const onError = () => {
    if (Array.isArray(logoUri) && indexValue.current + 1 < logoUri.length) {
      indexValue.current = indexValue.current + 1;
      setImageSource(addCacheTimestampToUri(logoUri[indexValue.current]));
      return;
    }
    setImageSource(undefined);
  };

  const avatarSize = IODimensions.size.avatar[size];
  const avatarPadding = IODimensions.padding.avatar[size];
  const avatarRadius = IODimensions.radius.avatar[size];

  return (
    <View
      accessibilityIgnoresInvertColors
      style={[
        styles.avatarWrapper,
        {
          height: avatarSize,
          width: avatarSize,
          borderRadius: avatarRadius,
          borderColor: avatarColors.border,
          backgroundColor:
            imageSource === undefined
              ? avatarColors.background.placeholder
              : avatarColors.background.logo,
          padding:
            imageSource === undefined
              ? avatarPadding.placeholder
              : avatarPadding.logo
        }
      ]}
    >
      {imageSource === undefined ? (
        <Icon color={avatarColors.icon} name="institution" size={"100%"} />
      ) : (
        <View
          style={[
            styles.avatarInnerWrapper,
            {
              backgroundColor: avatarColors.background.logo,
              borderRadius: avatarRadius - avatarPadding.logo
            }
          ]}
        >
          <Image
            accessibilityIgnoresInvertColors
            onError={onError}
            source={imageSource}
            style={styles.avatarImage}
          />
        </View>
      )}
    </View>
  );
};

export type AvatarSearchProps = Pick<
  ComponentProps<typeof Image>,
  "defaultSource" | "onError" | "source"
>;

/**
 * AvatarSearch component is used to display the logo of an institution in the
 * search results. A placeholder is displayed if the logo is not available.
 * Note: On Android, the default source prop is ignored on debug builds.
 *
 * @param AvatarSearchProps
 * @returns
 */
export const AvatarSearch = memo(
  ({ defaultSource, source, onError }: AvatarSearchProps) => {
    const avatarColors = useIOColors().component.avatar;

    // Visual attributes
    const avatarSize = IODimensions.size.avatar.small;
    const borderRadius = IODimensions.radius.avatar.small;
    const internalSpace = IODimensions.padding.avatar.small.logo;
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
            borderColor: avatarColors.border,
            backgroundColor: avatarColors.background.logo,
            padding: internalSpace
          }
        ]}
      >
        <View
          style={[
            styles.avatarInnerWrapper,
            {
              backgroundColor: avatarColors.background.logo,
              borderRadius: innerRadius
            }
          ]}
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
              onError={onError}
              source={source}
              style={styles.avatarImage}
            />
          )}
        </View>
      </View>
    );
  }
);
