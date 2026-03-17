import { test, expect } from '@playwright/test';

test.describe('Gallery page (/)', () => {
  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Meme Generator/i);
  });

  test('shows the header and Create Meme button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Meme Generator').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create Meme' })).toBeVisible();
  });

  test('Create Meme button navigates to /create', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Create Meme' }).click();
    await expect(page).toHaveURL(/\/create/);
  });

  test('shows Recent Memes heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Recent Memes' })).toBeVisible();
  });
});
