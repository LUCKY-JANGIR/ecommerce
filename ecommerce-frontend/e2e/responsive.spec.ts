import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const MOCK_PRODUCT_ID = 'mock-product-1';
const MOCK_PRODUCTS = [
  {
    _id: MOCK_PRODUCT_ID,
    name: 'Handwoven Heritage Rug',
    description: 'A meticulously crafted rug showcasing traditional artistry and modern durability.',
    price: 24999,
    images: ['/placeholder-product.svg'],
    category: {
      _id: 'category-1',
      name: 'Signature Rugs',
      description: 'Handwoven statement pieces',
    },
    stock: 12,
    parameters: [
      {
        _id: 'param-size',
        name: 'Size',
        type: 'select',
        options: ['4x6 ft', '5x8 ft', '6x9 ft'],
        required: true,
      },
      {
        _id: 'param-notes',
        name: 'Custom Notes',
        type: 'text',
        required: false,
        description: 'Tell our artisans about your space',
      },
      {
        _id: 'param-length',
        name: 'Custom Dimensions',
        type: 'dimensions',
        unit: 'inch',
        required: false,
      },
    ],
    averageRating: 4.6,
    numReviews: 32,
    createdAt: '2024-10-01T00:00:00.000Z',
    featured: true,
  },
  {
    _id: 'mock-product-2',
    name: 'Artisanal Wall Tapestry',
    description: 'Intricate handloom tapestry blending heritage motifs with contemporary palettes.',
    price: 18999,
    images: ['/placeholder-product.svg'],
    category: {
      _id: 'category-2',
      name: 'Wall Art',
      description: 'Bring walls to life with textiles',
    },
    stock: 4,
    createdAt: '2024-09-12T00:00:00.000Z',
    featured: true,
  },
];

const MOCK_REVIEWS = {
  reviews: [
    {
      _id: 'review-1',
      user: {
        _id: 'user-1',
        name: 'Aditi Sharma',
        email: 'aditi@example.com',
        role: 'user',
      },
      rating: 5,
      comment: 'The craftsmanship is unparalleled and the colors look stunning in our living room!',
      createdAt: '2024-11-12T00:00:00.000Z',
    },
    {
      _id: 'review-2',
      user: {
        _id: 'user-2',
        name: 'Rahul Mehta',
        email: 'rahul@example.com',
        role: 'user',
      },
      rating: 4,
      comment: 'Beautiful rug with vibrant hues. Delivery was quick and well packaged.',
      createdAt: '2024-11-02T00:00:00.000Z',
    },
  ],
};

const MOCK_CATEGORIES = [
  {
    _id: 'category-1',
    name: 'Signature Rugs',
    description: 'Handwoven statement pieces',
    productCount: 24,
  },
  {
    _id: 'category-2',
    name: 'Wall Art',
    description: 'Textiles for modern walls',
    productCount: 12,
  },
];

const MOCK_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalProducts: MOCK_PRODUCTS.length,
  hasNextPage: false,
  hasPrevPage: false,
};

const disableAnimations = async (page: Page) => {
  await page.addStyleTag({
    content: `*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; scroll-behavior: auto !important; }`,
  });
};

const runAxeCheck = async (page: Page, context: string) => {
  const ignoredRules = [
    'color-contrast',
    'region',
    'button-name',
    'link-name',
    'select-name',
    'heading-order',
    'landmark-main-is-top-level',
    'landmark-no-duplicate-main',
    'landmark-unique',
    'scrollable-region-focusable',
  ];

  const accessibilityScanResults = await new AxeBuilder({ page })
    .disableRules(ignoredRules)
    .analyze();

  expect(accessibilityScanResults.violations, `Accessibility violations on ${context}`).toEqual([]);
};

const setupApiMocks = async (page: Page) => {
  await page.route('**/api/products**', async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') {
      return route.continue();
    }

    const url = new URL(request.url());

    if (!url.pathname.startsWith('/api/products')) {
      return route.continue();
    }

    if (url.pathname.endsWith('/products/featured')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PRODUCTS) });
    }

    if (/\/api\/products\/[\w-]+\/reviews$/.test(url.pathname)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_REVIEWS) });
    }

    if (/\/api\/products\/[\w-]+$/.test(url.pathname)) {
      const productId = url.pathname.split('/').pop() || MOCK_PRODUCT_ID;
      const product = MOCK_PRODUCTS.find((item) => item._id === productId) || MOCK_PRODUCTS[0];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: product }),
      });
    }

    if (url.pathname.endsWith('/api/products')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { products: MOCK_PRODUCTS, pagination: MOCK_PAGINATION } }),
      });
    }

    return route.continue();
  });

  await page.route('**/api/categories**', async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') {
      return route.continue();
    }

    const url = new URL(request.url());
    if (!url.pathname.startsWith('/api/categories')) {
      return route.continue();
    }

    if (url.pathname.endsWith('/api/categories')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CATEGORIES) });
    }

    return route.continue();
  });
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const constantRandom = () => 0.5;
    Object.defineProperty(Math, 'random', {
      configurable: true,
      writable: true,
      value: constantRandom,
    });
  });

  await setupApiMocks(page);
});

test.describe('Responsive storefront experience', () => {
  test('home page snapshot & accessibility', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Hastkari/i);

    await runAxeCheck(page, 'home page');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot(`home-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('product list snapshot & accessibility', async ({ page }, testInfo) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(MOCK_PRODUCTS[0].name).first()).toBeVisible();

    await runAxeCheck(page, 'product listing');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot(`products-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('product detail snapshot & accessibility', async ({ page }, testInfo) => {
    await page.goto(`/products/${MOCK_PRODUCT_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: MOCK_PRODUCTS[0].name })).toBeVisible();

    await runAxeCheck(page, 'product detail');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot(`product-detail-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('cart snapshot & accessibility', async ({ page }, testInfo) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    const cartHeading = page.getByRole('heading', { name: /shopping cart|your cart is empty/i });
    await expect(cartHeading).toBeVisible();

    await runAxeCheck(page, 'cart page');
    await disableAnimations(page);

    await expect(page).toHaveScreenshot(`cart-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
