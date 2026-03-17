import { test, expect } from '@playwright/test';

test.describe('Create page (/create)', () => {
  test('shows the Meme Generator header and Finish button', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByRole('link', { name: 'Meme Generator' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
  });

  test('shows the template search input', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByPlaceholder('Search…')).toBeVisible();
  });

  test('shows the Upload button', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByRole('button', { name: /upload/i })).toBeVisible();
  });

  test('shows the Layers panel', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByText('Layers', { exact: true })).toBeVisible();
  });

  test('shows the Properties panel', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByText('Properties', { exact: true })).toBeVisible();
  });

  test('template search filters results', async ({ page }) => {
    await page.goto('/create');
    const search = page.getByPlaceholder('Search…');
    await search.fill('zzz_no_match_expected');
    await expect(page.getByText('No templates found.')).toBeVisible();
  });

  test('Meme Generator header links back to /', async ({ page }) => {
    await page.goto('/create');
    await page.getByRole('link', { name: 'Meme Generator' }).click();
    await expect(page).toHaveURL('/');
  });
});
