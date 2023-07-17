type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};
/**
 * function to handle getItemLayout prop for FlatList
 *
 * suggested usage consists in currying the function with the itemSize and dividerSize
 * @example myFunction = generateFlatListItemLayout(100, 10)
 *  then pass myFunction to getItemLayout
 * @param itemSize horizontal flatlist -> item width
 * @param dividerSize horizontal flatlist -> item separator width
 * @param totalItems total number of items in the list (data.length)
 * @param index  index
 * @example <FlatList getItemLayout={
 *  (_,index)=>myFunc(data.length)(index)
 * }/>
 */
export const generateFlatListItemLayout =
  (itemSize: number, dividerSize: number) =>
  (totalItems: number) =>
  (index: number): ItemLayout => {
    const itemWidthWithDivider = itemSize + dividerSize;
    return {
      length: index === totalItems ? itemSize : itemWidthWithDivider,
      offset: itemWidthWithDivider * index,
      index
    };
  };
