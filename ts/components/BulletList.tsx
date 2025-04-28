import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  HSpacer,
  IOSpacer,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ComponentProps, memo, useCallback } from "react";
import { View } from "react-native";

const BULLET_ITEM = "\u2022";

export type BulletListItem = {
  /**
   * The text of the list item.
   */
  value: string | Array<BodyProps>;
  /**
   * The id used as key, it must be unique.
   */
  id: string | number;
  /**
   * Used to customize list item.
   */
  textProps?: ComponentProps<typeof Body>;
  /**
   * Nested list.
   */
  list?: Array<Omit<BulletListItem, "list">>;
};

type Props = {
  /**
   * The bullet list title.
   */
  title: string;
  /**
   * The list to display bullet items.
   */
  list: Array<BulletListItem>;
  /**
   * Title extra props.
   */
  titleProps?: ComponentProps<typeof Body>;
  /**
   * Bullet item indentation and space between title e list items.
   */
  spacing?: IOSpacer;
};

/**
 * This component renders a bullet list. It supports two levels of nesting, so the first level `BulletListItem` can contain a `list` prop.
 *
 * @param {string} title The bullet list title.
 * @param {Array<BulletListItem>} list The array used to render the bullet list.
 * @param {ComponentProps<typeof Body>} [titleProps] Used to customize title.
 * @param {IOSpacer} [spacing] Used to define list item indentation and space between title and list.
 * @returns {JSX.Element} The rendered component.
 * @example
 * <BulletList
 *  title='Test:'
 *  list={[
 *    {value: 'Item-1', id: 'id-1' },
 *    {value: 'Item-2', id: 'id-2', list:[
 *       {value: 'Item-3', id: 'id-3'},
 *       {value: 'Item-4', id: 'id-4'}
 *    ]}
 *  ]}
 * />
 * // Output:
 * // - Test:
 * //  - Item-1
 * //  - Item-2
 * //    - Item-3
 * //    - Item-4
 */
export const BulletList = memo(
  ({ title, list, spacing = 8, titleProps = {} }: Props) => {
    /**
     * @param {Array<BulletListItem>} [list] The list to iterate.
     * @param {number} [count=0] The number a recursive calls, used to stop the cycle when nesting level is equal to two.
     * @returns {JSX.Element} The rendered list.
     */
    const renderListItems = useCallback(
      (list?: Array<BulletListItem>, count: number = 0) =>
        list?.map(({ id, value, textProps = {}, ...rest }) => (
          <View key={id} style={{ flexDirection: "row" }}>
            <HSpacer size={spacing} />
            <Body>{BULLET_ITEM}</Body>
            <HSpacer size={spacing} />
            <Body {...textProps}>
              {Array.isArray(value) ? (
                <ComposedBodyFromArray body={value} />
              ) : (
                value
              )}
            </Body>
            {"list" in rest &&
              count === 0 &&
              renderListItems(rest.list, count + 1)}
          </View>
        )),
      [spacing]
    );

    return (
      <View>
        <Body {...titleProps}>{title}</Body>
        <VSpacer size={spacing} />
        <View accessible={true} accessibilityRole="list">
          {renderListItems(list)}
        </View>
      </View>
    );
  }
);
