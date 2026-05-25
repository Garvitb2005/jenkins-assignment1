# Selenium TestNG UI tests

This folder contains a small Maven-based TestNG project with Selenium WebDriver tests for the frontend `register` and `login` pages.

Requirements:

- Java 11+
- Maven

Run tests:

```bash
cd selenium-tests
mvn test -DbaseUrl=http://localhost:5173
```

Notes:

- The default `baseUrl` is `http://localhost:5173`. Override with `-DbaseUrl=...` if your dev server runs on a different port.
- Tests run Chrome in headless mode using WebDriverManager to manage drivers.
