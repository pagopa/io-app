/**
 * Implements the Privacy rules.
 *
 * @providesModule Provacy
 * @flow
 */

'use strict'

const React = require('React')

import { StyleSheet, View, Text } from 'react-native'

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#D8D8D8',
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24
  },
  closeModal: {
    fontSize: 30,
    textAlign: 'right',
    paddingTop: 40,
    fontFamily: 'Titillium Web',
    color: '#17324D'
  },
  title: {
    paddingTop: 50,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#132535',
    fontFamily: 'Titillium Web'
  },
  mainText: {
    paddingTop: 15,
    color: '#4a5b6f',
    fontFamily: 'Titillium Web',
    fontSize: 16,
    lineHeight: 24
  }
})

export class PersonalData extends React.Component {
  props: {
    closeModal: () => void
  }
  _handleBack() {
    this.props.closeModal()
  }
  render() {
    return (
      <View style={styles.content}>
        <Text
          style={styles.closeModal}
          onPress={() => {
            this._handleBack()
          }}
        >
          {' '}
          X{' '}
        </Text>

        <Text style={styles.title}>
          Regole sul trattamento dei dati personali
        </Text>
        <Text style={styles.mainText}>
          M. Brutus Athenis philosophiam, Rhodi eloquentiam didicit. Eius pater,
          Sullae inimicus, iussu Pompeii necatus erat, quare Brutus cum eo
          graves simultates habuerat. Bello tamen civili Pompeio favit er
          dolorem suum rei publicae utilitati postposuit. Cum Pompeius
          profligatus esset, Brutus a Caesare servatus est, pro filio ductus
          est, et idem praetor creatus est. Postea cum Caesar senatum
          contemneret et regnum peteret, Brutus cum Cassio et aliis civibus
          conspiravit adversus eum. Cum Caesar in Curia vulneratus est, inter
          coniuratos Brutum vidit maestusque ei dixit :"Tu quoque, Brute, fili
          mi ?".
        </Text>
      </View>
    )
  }
}
