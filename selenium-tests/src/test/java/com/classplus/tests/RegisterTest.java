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

        // Open register page
        driver.get(baseUrl + "/register");

        // Find elements
        WebElement name = driver.findElement(By.cssSelector("input[placeholder='Name']"));
        WebElement email = driver.findElement(By.cssSelector("input[placeholder='Email']"));
        WebElement password = driver.findElement(By.cssSelector("input[placeholder='Password']"));
        WebElement submit = driver.findElement(By.cssSelector("button[type='submit']"));

        // Create unique email every run
        String uniqueEmail = "selenium+" + System.currentTimeMillis() + "@example.com";

        // Fill form
        name.sendKeys("Selenium Test User");
        email.sendKeys(uniqueEmail);
        password.sendKeys("TestPass123!");

        System.out.println("Submitting registration form...");

        // Submit form
        submit.click();

        System.out.println("Waiting for navigation after registration...");

        // Wait for URL to change from /register
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));

        wait.until(ExpectedConditions.not(
                ExpectedConditions.urlContains("/register")
        ));

        // Get current URL
        String currentUrl = driver.getCurrentUrl();

        System.out.println("Navigated URL: " + currentUrl);

        // Check if any UI error message is shown
        if (driver.findElements(By.cssSelector(".error-message")).size() > 0) {

            String errorText = driver.findElement(By.cssSelector(".error-message")).getText();

            Assert.fail("Registration failed in UI: " + errorText);
        }

        // Final validation
        Assert.assertFalse(
                currentUrl.contains("/register"),
                "Registration failed. User is still on register page."
        );

        System.out.println("Registration test passed successfully.");
    }
}