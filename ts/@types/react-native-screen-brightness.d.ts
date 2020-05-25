declare module 'react-native-screen-brightness'{
    const ScreenBrightness: {
        getAppBrightness(): Promise<number>;
        setAppBrightness(val: number): Promise<number>;
        getBrightness(): Promise<number>;
        setBrightness(val: number): Promise<number>;
    }
    export default ScreenBrightness;
}