package it.pagopa.io.app;
import expo.modules.ReactActivityDelegateWrapper

import android.content.pm.ActivityInfo;
import android.os.Build;
import android.os.Bundle;

import androidx.appcompat.app.AlertDialog;
import androidx.core.view.WindowCompat;

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import org.devio.rn.splashscreen.SplashScreen;

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "IO"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled))

  // https://github.com/crazycodeboy/react-native-splash-screen#third-stepplugin-configuration
    override fun onCreate(savedInstanceState: Bundle?) {
        // Enable edge to edge support
        // https://developer.android.com/develop/ui/views/layout/edge-to-edge?hl=it
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        SplashScreen.show(this, R.style.SplashScreenTheme);
        // This is needed for react-native-screens to solve the issue described here:
        // https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704633
        super.onCreate(null);
    }
}
