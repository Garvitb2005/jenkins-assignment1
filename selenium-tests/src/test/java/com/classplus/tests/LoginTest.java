package com.classplus.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test(description = "Verify login form fields accept input")
    public void loginFormAcceptsInput() {
        driver.get(baseUrl + "/login");

        WebElement email = driver.findElement(By.cssSelector("input[placeholder='Email']"));
        WebElement password = driver.findElement(By.cssSelector("input[placeholder='Password']"));
        WebElement submit = driver.findElement(By.cssSelector("button[type='submit']"));

        email.sendKeys("selenium-login@example.com");
        password.sendKeys("LoginPass123!");

        Assert.assertEquals(email.getAttribute("value"), "selenium-login@example.com", "Email input should contain typed value");
        Assert.assertEquals(password.getAttribute("value"), "LoginPass123!", "Password input should contain typed value");
        Assert.assertTrue(submit.isDisplayed() && submit.isEnabled(), "Submit button should be visible and enabled");
    }
}
