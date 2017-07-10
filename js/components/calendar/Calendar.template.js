import {
  Content,
	Text,
  Separator,
  List,
} from 'native-base'

import { CalendarItem } from './item/CalendarItem.component';

export default props => {

  return (
    <Content>
      <List>
        <Separator bordered style={{backgroundColor: '#0066cc'}}>
          <Text style={{color:'#fff', fontWeight: 'bold'}}>PROSSIMI 7 GIORNI</Text>
        </Separator>
        <CalendarItem date='4 Maggio' title='Bollo auto' amount='€ 127,00' />
        <CalendarItem date='6 Maggio' title='TARI' amount='€ 86,20' />
        <CalendarItem last date='7 Maggio' title='Iscrizione a scuola' amount='€ 15,10' />
        <Separator bordered style={{backgroundColor: '#1f8fff'}}>
          <Text style={{color:'#fff', fontWeight: 'bold'}}>PROSSIMO MESE</Text>
        </Separator>
        <CalendarItem last date='1 Giugno' title='IMU' amount='€ 217,40' />
        <Separator bordered>
          <Text>PIÙ AVANTI</Text>
        </Separator>
        <CalendarItem last date='1 Settembre' title='Iscrizione a scuola' amount='' />
      </List>
    </Content>
  );
}
