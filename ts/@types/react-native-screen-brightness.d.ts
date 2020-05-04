declare module 'react-native-screen-brightness'{
    const ScreenBrightness: {
        getAppBrightness(): Promise<number>;
        setAppBrightness(val: number): void;
    }
    export default ScreenBrightness;
}