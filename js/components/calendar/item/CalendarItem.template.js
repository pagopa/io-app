import {
    Text,
    ListItem,
    List,
    Grid,
    Row,
    Col,
} from 'native-base'

export default props => {

  return (
    <listitem last={ this.props.last }>
      <grid>
        <col>
          <row>
            <text style={{ fontsize: 14, marginbottom: 5 }} > { this.props.date }</text>
          </row>
          <row>
            <col size={ 10 }>
              <row>
                <text style={{ fontsize: 20, fontweight: 'bold' }} > { this.props.title }</text>
              </row>
            </col>
            <col size={ 5 }>
              <row style={{ justifycontent: 'flex-end' }}>
                <text style={{ fontsize: 20, fontweight: 'bold' }} > { this.props.amount }</text>
              </row>
            </col>
          </row>
        </col>
      </grid>
    </listitem>);
}
