import { test, expect } from '@playwright/test';

test.describe('Procurement App E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('http://localhost:5173/login');
  });

  test('should login as admin and create a purchase request', async ({ page }) => {
    // 1. Login
    await page.getByPlaceholder(/username/i).fill('admin'); // Assume 'admin' is valid for local testing
    await page.getByPlaceholder(/password/i).fill('admin123'); // Assume this is a valid password
    await page.getByRole('button', { name: /sign in/i }).click();

    // 2. Navigate to Dashboard or Purchase Requests
    // Ensure we are logged in by checking if Dashboard or a main nav item is visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
    
    // 3. Go to Purchase Requests page
    await page.getByRole('link', { name: /purchase requests/i }).click();
    
    // 4. Create new Request
    await page.getByRole('button', { name: /create request/i }).click();

    // 5. Fill out the form
    await expect(page.getByRole('heading', { name: /new purchase request/i })).toBeVisible();
    await page.getByLabel(/purpose/i).fill('E2E Test Purchase');
    await page.getByLabel(/date needed/i).fill('2026-12-31');
    
    // Fill the first item
    await page.getByLabel(/item 1/i).fill('Office Supplies');
    await page.getByLabel(/quantity/i).fill('5');
    await page.getByLabel(/unit price/i).fill('100');

    // Submit
    await page.getByRole('button', { name: /submit request/i }).click();

    // 6. Verify creation (assuming success redirects or shows a success toast)
    // Here we wait for the table or list to contain our new request
    await expect(page.getByText('E2E Test Purchase')).toBeVisible({ timeout: 10000 });
  });
});
