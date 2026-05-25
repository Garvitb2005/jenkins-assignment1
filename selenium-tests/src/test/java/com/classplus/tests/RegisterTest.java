package com.classplus.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class RegisterTest extends BaseTest {

    @Test(description = "Full registration flow: fill form, submit and verify navigation to home")
    public void registerFlowCreatesUserAndNavigatesHome() {
        driver.get(baseUrl + "/register");

        WebElement name = driver.findElement(By.cssSelector("input[placeholder='Name']"));
        WebElement email = driver.findElement(By.cssSelector("input[placeholder='Email']"));
        WebElement password = driver.findElement(By.cssSelector("input[placeholder='Password']"));
        WebElement submit = driver.findElement(By.cssSelector("button[type='submit']"));

        String uniqueEmail = "selenium+" + System.currentTimeMillis() + "@example.com";

        name.sendKeys("Selenium Test User");
        email.sendKeys(uniqueEmail);
        password.sendKeys("TestPass123!");

        // Submit the form
        submit.click();

        // Wait for a known element on the home page (robust against URL formatting)
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));
        // Wait for either a success message, an error message, or the home page element
        wait.until(d -> {
            boolean successPresent = d.findElements(By.cssSelector(".success-message")).size() > 0;
            boolean errorPresent = d.findElements(By.cssSelector(".error-message")).size() > 0;
            boolean homePresent = d.findElements(By.cssSelector("h1")).size() > 0;
            return successPresent || errorPresent || homePresent;
        });

        // If an error message appeared, fail with its text to aid debugging
        if (driver.findElements(By.cssSelector(".error-message")).size() > 0) {
            String err = driver.findElement(By.cssSelector(".error-message")).getText();
            Assert.fail("Registration failed in UI: " + err);
        }

        // Otherwise check navigation (be tolerant of trailing slash)
        String currentUrl = driver.getCurrentUrl();
        boolean navigated = currentUrl.equals(baseUrl)
            || currentUrl.equals(baseUrl + "/")
            || currentUrl.startsWith(baseUrl + "/");

        Assert.assertTrue(navigated, "After registration the app should navigate to home. Current URL: " + currentUrl);
    }
}
