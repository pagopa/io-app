/**
 * A file with useful types for React Native
 *
 * @flow
 */

import * as React from 'react'

export type ListRenderItemInfo<ItemT> = {
  item: ItemT,

  index: number,

  separators: {
    highlight: () => void,
    unhighlight: () => void,
    // eslint-disable-next-line flowtype/no-weak-types
    updateProps: (select: 'leading' | 'trailing', newProps: any) => void
  }
}

export type ListRenderItem<ItemT> = (
  info: ListRenderItemInfo<ItemT>
  // eslint-disable-next-line flowtype/no-weak-types
) => ?React.Element<any>
