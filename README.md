# PoC app Cittadinanza Digitale

## Cos'è?

È un applicazione mobile per iOS e Android che usiamo come banco di prova per le integrazioni con le componenti di piattaforma del sistema operativo del Paese.

## Tecnologie usate

* [React Native](https://facebook.github.io/react-native)
* [Redux](http://redux.js.org/)
* [Native Base](http://nativebase.io)
* [Flow](https://flow.org/)

## Architettura

### Autenticazione SPID

L'applicazione si appoggia ad un backend web per l'autenticazione a SPID. Il backend implementa un Service Provider SAML2 che si occupa dell'autenticazione dell'utente sugli Identity Provider SPID.

L'autenticazione tra l'applicazione e il backend avviene tramite un token di sessione, generato dal backend al momento dell'autenticazione sull'IdP SPID.

Una volta che il backend comunica il token di sessione all'applicazione, questo viene usato per tutte le successive chiamate che l'applicazione fa alle API esposte dal backend.

Il flusso di autenticazione è il seguente:

1. L'utente seleziona l'IdP
2. L'app apre una webview sull'endpoint di autenticazione Shibboleth implementato nel backend, specificando l'entity ID dell'IdP selezionato dall'utente e, come URL di ritorno, l'URL dell'endpoint che genera un nuovo token di sessione (es. `/app/token/new`).
3. Shibboleth prende in carico il processo di autenticazione verso l'IdP
4. Ad autenticazione avvenuta, viene fatto un redirect dall'IdP all'endpoint del backend che si occupa della generazione di un nuovo token di sessione.
5. L'endpoint di generazione di un nuovo token riceve via header HTTP gli attributi SPID, poi genera un nuovo token di sessione (es. `123456789`) e restituisce alla webview un HTTP redirect verso un URL _well known_, contenente il token di sessione (es. `/api/token/123456789`)
6. L'app, che controlla la webview, intercetta questo URL prima che venga effettuata la richiesta HTTP, ne estrae il token di sessione e termina il flusso di autenticazione chiudendo la webview.  

Successivamente il token di sessione viene usato dall'app per effettuare le chiamate all'API di backend (es. per ottenere gli attributi SPID).

## Come contribuire

### Pre-requisiti

#### Nodenv

Su macOS e Linux si consiglia l'uso di [nodenv](https://github.com/nodenv/nodenv) per la gestione di versione multiple di NodeJS.

La versione di node usata nel progetto [è questa](https://github.com/teamdigitale/ItaliaApp/blob/master/.node-version).

#### Yarn

Per la gestione delle dipendenze usiamo [Yarn](https://yarnpkg.com/lang/en/).

#### React Native

Seguire [il tutorial](https://facebook.github.io/react-native/docs/getting-started.html) per il proprio sistema operativo.

Se si dispone di un sistema macOS è possibile seguire sia il tutorial per iOS che per Android. Se invece si dispone di un sistema Linux o Windows sarà possibile instalalre solo l'ambiente di sviluppo per Android.

### Compilazione (dev)

Per prima cosa installiamo le librerie usate dal progetto:

```
$ cd ItaliaApp
$ yarn
```

E poi compiliamo e lanciamo l'app su Android:

```
$ react-native run-android
```

Oppure su iOS:

```
$ react-native run-ios
```

### Compilazione (release)

#### iOS

#### Android

Vedere tutorial su [Generating Signed APK](https://facebook.github.io/react-native/docs/signed-apk-android.html#setting-up-gradle-variables).

### Installazione su device

```
react-native run-ios --configuration Release --device 'device name'
```

### Aggiornare icone dell'applicazione

Vedere [questo tutorial](https://blog.bam.tech/developper-news/change-your-react-native-app-icons-in-a-single-command-line).
