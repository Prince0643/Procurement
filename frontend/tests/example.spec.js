import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // Assuming the frontend runs on localhost:5173 or localhost:3000
  // Adjust the URL to your actual local development server URL
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  // Update "Procurement" to match your app's actual title if it's different.
  await expect(page).toHaveTitle(/Procurement/);
});

test('can navigate to login', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  
  // Look for the login form elements.
  const usernameInput = page.getByPlaceholder(/username/i).or(page.locator('input[type="text"]'));
  const passwordInput = page.getByPlaceholder(/password/i).or(page.locator('input[type="password"]'));
  
  await expect(usernameInput.first()).toBeVisible();
  await expect(passwordInput.first()).toBeVisible();
});
