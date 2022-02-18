import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class TestEntry {
public static void main(String[] args) {
    // load properties
    Properties properties = new Properties();
    InputStream inputStream = TestEntry.class.getClassLoader().getResourceAsStream("config.properties");
    try {
        properties.load(inputStream);
    } catch (IOException ioException) {
        ioException.printStackTrace();
    }

    // set driver config, open mymeeting
    System.setProperty("webdriver.chrome.driver", properties.getProperty("chromeDriverPath"));
    Map<String, Object> chromeOptions = new HashMap<String, Object>();
    chromeOptions.put("binary", properties.getProperty("appPath"));
    DesiredCapabilities capabilities = new DesiredCapabilities();
    capabilities.setCapability("chromeOptions", chromeOptions);
    capabilities.setBrowserName("chrome");
    WebDriver driver = new ChromeDriver(capabilities);

    driver.manage().window().maximize();
}
}
