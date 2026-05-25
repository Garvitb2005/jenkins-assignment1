package com.classplus.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;

public class BaseTest {
    protected WebDriver driver;
    protected String baseUrl;

    @BeforeClass(alwaysRun = true)
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        String headlessProp = System.getProperty("headless", "false");
        boolean headless = Boolean.parseBoolean(headlessProp);
        if (headless) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        driver = new ChromeDriver(options);

        baseUrl = System.getProperty("baseUrl", "http://localhost:5173");
        // Ensure backend is reachable before running UI tests (helps CI flaky failures)
        String apiBase = System.getProperty("apiBase", "http://localhost:8000");
        boolean ok = waitForEndpoint(apiBase, Duration.ofSeconds(30));
        if (!ok) {
            System.err.println("WARNING: backend at " + apiBase + " not reachable after 30s. Tests may fail with 'Failed to fetch'.");
        } else {
            System.out.println("Backend reachable at " + apiBase);
        }
    }

    @AfterClass(alwaysRun = true)
    public void tearDown() throws InterruptedException {
        Thread.sleep(3000);
        if (driver != null) {
            driver.quit();
        }
    }

    private boolean waitForEndpoint(String baseUrl, Duration timeout) {
        Instant deadline = Instant.now().plus(timeout);
        while (Instant.now().isBefore(deadline)) {
            try {
                URL url = new URL(baseUrl + "/");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(2000);
                conn.setReadTimeout(2000);
                conn.setRequestMethod("GET");
                conn.connect();
                int code = conn.getResponseCode();
                // any response (200, 404, etc.) means service is reachable
                return true;
            } catch (IOException e) {
                try {
                    Thread.sleep(500);
                } catch (InterruptedException ignored) {
                }
            }
        }
        return false;
    }
}
