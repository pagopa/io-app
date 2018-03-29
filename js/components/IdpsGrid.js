// @flow

import * as React from 'react'
import { Dimensions, StyleSheet, FlatList, Image } from 'react-native'

import { View, Button } from 'native-base'

import { type ListRenderItemInfo } from '../lib/react-native/types'
import { type IdentityProvider } from '../utils/api'
import variables from '../theme/variables'

type OwnProps = {
  // Array of Identity Provider to show in the grid.
  idps: $ReadOnlyArray<IdentityProvider>,
  // A callback function called when an Identity Provider is selected
  onIdpSelected: IdentityProvider => void
}

type Props = OwnProps

const { width } = Dimensions.get('window')

const GRID_GUTTER = 10

/**
 * To create a space within items in the same row we use the bootstrap method of adding a negative margin
 * than a padding to each item.
 */
const styles = StyleSheet.create({
  gridContainer: {
    margin: -GRID_GUTTER
  },
  gridItem: {
    padding: GRID_GUTTER,
    // Calculate the real width of each item
    // eslint-disable-next-line no-magic-numbers
    width: (width - (2 * variables.contentPadding - 2 * GRID_GUTTER)) / 2
  },
  idpLogo: {
    width: 120,
    height: 30,
    resizeMode: 'contain'
  }
})

/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */
class IdpsGrid extends React.Component<Props> {
  render(): React.Node {
    const { idps } = this.props
    return (
      <FlatList
        style={styles.gridContainer}
        numColumns={2}
        data={idps}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
        onPress
      />
    )
  }

  keyExtractor = (idp: IdentityProvider): string => {
    return idp.id
  }

  /* eslint-disable flowtype/no-weak-types */
  renderItem = (
    info: ListRenderItemInfo<IdentityProvider>
  ): ?React.Element<any> => {
    const { onIdpSelected } = this.props
    const idp = info.item
    return (
      <View style={styles.gridItem}>
        <Button block white onPress={(): void => onIdpSelected(idp)}>
          <Image source={idp.logo} style={styles.idpLogo} />
        </Button>
      </View>
    )
  }
}

export default IdpsGrid
