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

        // Wait for navigation to home (/) or for a known element on the home page
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        boolean navigated = wait.until(driver -> driver.getCurrentUrl().equals(baseUrl + "/"));

        Assert.assertTrue(navigated, "After registration the app should navigate to home");
    }
}
