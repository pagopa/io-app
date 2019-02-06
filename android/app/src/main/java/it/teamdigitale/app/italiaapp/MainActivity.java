package it.teamdigitale.app.italiaapp;

import android.os.Bundle;
import android.view.WindowManager;
import com.facebook.react.ReactActivity;
import com.calendarevents.CalendarEventsPackage;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ItaliaApp";
    }

    // see https://github.com/crazycodeboy/react-native-splash-screen#third-stepplugin-configuration
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this, R.style.SplashScreenTheme);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
      CalendarEventsPackage.onRequestPermissionsResult(requestCode, permissions, grantResults);
      super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
