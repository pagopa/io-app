# PoC app Cittadinanza Digitale

## Cos'è?

È un applicazione mobile per iOS e Android che usiamo come banco di prova per le integrazioni con le componenti di piattaforma del sistema operativo del Paese.

## Tecnologie usate

* [React Native](https://facebook.github.io/react-native)
* [Redux](http://redux.js.org/)
* [Native Base](http://nativebase.io)
* [Flow](https://flow.org/)

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

### Compilazione

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

### Installazione su device

```
react-native run-ios --configuration Release --device 'device name'
```
