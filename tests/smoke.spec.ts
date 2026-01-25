import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Member Login' })).toBeVisible();
});

test('donor routes redirect to login when logged out', async ({ page }) => {
  await page.goto('/donor');
  await expect(page).toHaveURL(/\/auth\/login/);
});

