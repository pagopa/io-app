/**
 * A file with useful types for React Native
 *
 * @flow
 */

/* eslint-disable flowtype/no-weak-types */

import * as React from 'react'

export type ListRenderItemInfo<ItemT> = {
  item: ItemT,

  index: number,

  separators: {
    highlight: () => void,
    unhighlight: () => void,
    updateProps: (select: 'leading' | 'trailing', newProps: any) => void
  }
}

export type ListRenderItem<ItemT> = (
  info: ListRenderItemInfo<ItemT>
) => ?React.Element<any>
