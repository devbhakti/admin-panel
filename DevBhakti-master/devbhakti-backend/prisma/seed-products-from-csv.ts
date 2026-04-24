import { Prisma, PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import path from 'path';

const prisma = new PrismaClient();

const DEFAULT_CSV_DIR = path.resolve(process.cwd(), 'prisma', 'csv');
const DEFAULT_SELLER_PROFILE_CSV = path.join(DEFAULT_CSV_DIR, 'SellerProfile.csv');
const DEFAULT_PRODUCT_CATEGORY_CSV = path.join(DEFAULT_CSV_DIR, 'ProductCategory.csv');
const DEFAULT_PRODUCT_CSV = path.join(DEFAULT_CSV_DIR, 'Product.csv');

type CsvRow = Record<string, string>;

type ProductCategoryCsvRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: string;
  sortOrder: string;
  createdAt: string;
  updatedAt: string;
};

type SellerProfileCsvRow = {
  id: string;
  name: string;
  location: string;
  fullAddress: string;
  description: string;
  image: string;
  heroImages: string;
  category: string;
  openTime: string;
  phone: string;
  website: string;
  isActive: string;
  isVerified: string;
  userId: string;
  productCommissionRate: string;
  createdAt: string;
  updatedAt: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;
  pickupLocation: string;
};

type ProductCsvRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  image: string;
  templeId: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  highlights: string;
  longDescription: string;
  shippingInfo: string;
  origin: string;
  rating: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  sellerId: string;
};

function valueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

async function readCsv(filePath: string): Promise<CsvRow[]> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = await workbook.csv.readFile(filePath);
  const rows: CsvRow[] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    const values = (row.values as unknown[]).slice(1).map(valueToString);

    if (rowNumber === 1) {
      headers = values;
      return;
    }

    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });

    if (Object.values(record).some(Boolean)) {
      rows.push(record);
    }
  });

  return rows;
}

function parseBoolean(value: string, fallback = false): boolean {
  if (!value) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

function parseNumber(value: string, fallback = 0): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeLookup(value: string): string {
  return valueToString(value).toLowerCase().replace(/\s+/g, ' ');
}

function toLocalizedText(value: string): Prisma.InputJsonValue | undefined {
  if (!value) {
    return undefined;
  }

  return { en: value } as Prisma.InputJsonValue;
}

function parseStringArray(value: string): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => valueToString(item)).filter(Boolean);
    }
  } catch {
    return [];
  }

  return [];
}

function uniqueNameSlug(name: string, id: string, usedSlugs: Set<string>): string {
  const baseSlug = slugifyName(name) || id.toLowerCase();
  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);
    return baseSlug;
  }

  let counter = 2;
  while (usedSlugs.has(`${baseSlug}-${counter}`)) {
    counter += 1;
  }

  const candidate = `${baseSlug}-${counter}`;
  usedSlugs.add(candidate);
  return candidate;
}

async function upsertProductCategories(rows: ProductCategoryCsvRow[]) {
  const existing = await prisma.productCategory.findMany({
    select: { id: true, nameSlug: true },
  });
  const usedSlugs = new Set(existing.map((item) => item.nameSlug).filter(Boolean) as string[]);
  const existingSlugById = new Map(existing.map((item) => [item.id, item.nameSlug || undefined]));

  for (const row of rows) {
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;
    const nameSlug = existingSlugById.get(row.id) || uniqueNameSlug(row.name, row.id, usedSlugs);

    await prisma.productCategory.upsert({
      where: { id: row.id },
      update: {
        name: toLocalizedText(row.name),
        description: toLocalizedText(row.description),
        image: row.image || undefined,
        isActive: parseBoolean(row.isActive, true),
        sortOrder: Math.trunc(parseNumber(row.sortOrder, 0)),
        nameSlug,
        updatedAt,
      },
      create: {
        id: row.id,
        name: toLocalizedText(row.name),
        description: toLocalizedText(row.description),
        image: row.image || undefined,
        isActive: parseBoolean(row.isActive, true),
        sortOrder: Math.trunc(parseNumber(row.sortOrder, 0)),
        createdAt,
        updatedAt,
        nameSlug,
      },
    });
  }
}

async function validateSellerProfiles(rows: SellerProfileCsvRow[]) {
  const userIds = Array.from(new Set(rows.map((row) => row.userId).filter(Boolean)));
  const existingUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });
  const existingUserIds = new Set(existingUsers.map((item) => item.id));
  const missingUserIds = userIds.filter((id) => !existingUserIds.has(id));

  if (missingUserIds.length > 0) {
    throw new Error(`Missing User IDs for SellerProfile.userId: ${missingUserIds.join(', ')}`);
  }
}

async function upsertSellerProfiles(rows: SellerProfileCsvRow[]) {
  for (const row of rows) {
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;

    await prisma.sellerProfile.upsert({
      where: { id: row.id },
      update: {
        name: toLocalizedText(row.name) ?? Prisma.JsonNull,
        location: toLocalizedText(row.location),
        fullAddress: toLocalizedText(row.fullAddress),
        description: toLocalizedText(row.description),
        image: row.image || undefined,
        heroImages: parseStringArray(row.heroImages),
        category: toLocalizedText(row.category),
        openTime: row.openTime || undefined,
        phone: row.phone || undefined,
        website: row.website || undefined,
        isActive: parseBoolean(row.isActive, true),
        isVerified: parseBoolean(row.isVerified, false),
        userId: row.userId,
        productCommissionRate: parseNumber(row.productCommissionRate, 10),
        accountHolderName: row.accountHolderName || undefined,
        accountNumber: row.accountNumber || undefined,
        bankName: row.bankName || undefined,
        ifscCode: row.ifscCode || undefined,
        upiId: row.upiId || undefined,
        pickupLocation: row.pickupLocation || undefined,
        updatedAt,
      },
      create: {
        id: row.id,
        name: toLocalizedText(row.name) ?? ({ en: row.id } as Prisma.InputJsonValue),
        location: toLocalizedText(row.location),
        fullAddress: toLocalizedText(row.fullAddress),
        description: toLocalizedText(row.description),
        image: row.image || undefined,
        heroImages: parseStringArray(row.heroImages),
        category: toLocalizedText(row.category),
        openTime: row.openTime || undefined,
        phone: row.phone || undefined,
        website: row.website || undefined,
        isActive: parseBoolean(row.isActive, true),
        isVerified: parseBoolean(row.isVerified, false),
        userId: row.userId,
        productCommissionRate: parseNumber(row.productCommissionRate, 10),
        createdAt,
        updatedAt,
        accountHolderName: row.accountHolderName || undefined,
        accountNumber: row.accountNumber || undefined,
        bankName: row.bankName || undefined,
        ifscCode: row.ifscCode || undefined,
        upiId: row.upiId || undefined,
        pickupLocation: row.pickupLocation || undefined,
      },
    });
  }
}

function buildCategoryLookup(rows: ProductCategoryCsvRow[]): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const row of rows) {
    const normalizedName = normalizeLookup(row.name);
    if (normalizedName) {
      lookup.set(normalizedName, row.id);
      lookup.set(slugifyName(row.name), row.id);
    }
  }

  return lookup;
}

async function validateProductReferences(
  products: ProductCsvRow[],
  categoryLookup: Map<string, string>,
) {
  const categoryIds = new Set<string>();
  const templeIds = new Set<string>();
  const sellerIds = new Set<string>();
  const missingCategoryLabels = new Set<string>();

  for (const row of products) {
    const rawCategoryId = valueToString(row.categoryId);
    const fallbackCategoryId =
      categoryLookup.get(normalizeLookup(row.category)) ||
      categoryLookup.get(slugifyName(row.category)) ||
      '';
    const resolvedCategoryId = rawCategoryId || fallbackCategoryId;

    if (resolvedCategoryId) {
      categoryIds.add(resolvedCategoryId);
    } else if (row.category) {
      missingCategoryLabels.add(row.category);
    }

    if (row.templeId) {
      templeIds.add(row.templeId);
    }

    if (row.sellerId) {
      sellerIds.add(row.sellerId);
    }
  }

  const [existingCategories, existingTemples, existingSellers] = await Promise.all([
    prisma.productCategory.findMany({ where: { id: { in: Array.from(categoryIds) } }, select: { id: true } }),
    prisma.temple.findMany({ where: { id: { in: Array.from(templeIds) } }, select: { id: true } }),
    prisma.sellerProfile.findMany({ where: { id: { in: Array.from(sellerIds) } }, select: { id: true } }),
  ]);

  const existingCategoryIds = new Set(existingCategories.map((item) => item.id));
  const existingTempleIds = new Set(existingTemples.map((item) => item.id));
  const existingSellerIds = new Set(existingSellers.map((item) => item.id));

  const missingCategoryIds = Array.from(categoryIds).filter((id) => !existingCategoryIds.has(id));
  const missingTempleIds = Array.from(templeIds).filter((id) => !existingTempleIds.has(id));
  const missingSellerIds = Array.from(sellerIds).filter((id) => !existingSellerIds.has(id));

  if (
    missingCategoryIds.length > 0 ||
    missingTempleIds.length > 0 ||
    missingSellerIds.length > 0 ||
    missingCategoryLabels.size > 0
  ) {
    const messages: string[] = [];

    if (missingCategoryIds.length > 0) {
      messages.push(`Missing ProductCategory IDs: ${missingCategoryIds.join(', ')}`);
    }

    if (missingCategoryLabels.size > 0) {
      messages.push(`Unmatched product category names: ${Array.from(missingCategoryLabels).sort().join(', ')}`);
    }

    if (missingTempleIds.length > 0) {
      messages.push(`Missing Temple IDs: ${missingTempleIds.join(', ')}`);
    }

    if (missingSellerIds.length > 0) {
      messages.push(`Missing SellerProfile IDs: ${missingSellerIds.join(', ')}`);
    }

    throw new Error(messages.join(' | '));
  }
}

async function upsertProducts(rows: ProductCsvRow[], categoryLookup: Map<string, string>) {
  const unmatchedCategories = new Set<string>();

  for (const row of rows) {
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;
    const categoryId =
      valueToString(row.categoryId) ||
      categoryLookup.get(normalizeLookup(row.category)) ||
      categoryLookup.get(slugifyName(row.category)) ||
      undefined;

    if (row.category && !categoryId) {
      unmatchedCategories.add(row.category);
    }

    await prisma.product.upsert({
      where: { id: row.id },
      update: {
        status: row.status || 'pending',
        image: row.image || undefined,
        templeId: row.templeId || undefined,
        updatedAt,
        categoryId,
        rating: parseNumber(row.rating, 4.5),
        weight: parseNumber(row.weight, 0.5),
        length: parseNumber(row.length, 10),
        width: parseNumber(row.width, 10),
        height: parseNumber(row.height, 10),
        sellerId: row.sellerId || undefined,
        category: toLocalizedText(row.category),
        description: toLocalizedText(row.description),
        highlights: toLocalizedText(row.highlights),
        longDescription: toLocalizedText(row.longDescription),
        name: toLocalizedText(row.name),
        origin: toLocalizedText(row.origin),
        shippingInfo: toLocalizedText(row.shippingInfo),
      },
      create: {
        id: row.id,
        status: row.status || 'pending',
        image: row.image || undefined,
        templeId: row.templeId || undefined,
        createdAt,
        updatedAt,
        categoryId,
        rating: parseNumber(row.rating, 4.5),
        weight: parseNumber(row.weight, 0.5),
        length: parseNumber(row.length, 10),
        width: parseNumber(row.width, 10),
        height: parseNumber(row.height, 10),
        sellerId: row.sellerId || undefined,
        category: toLocalizedText(row.category),
        description: toLocalizedText(row.description),
        highlights: toLocalizedText(row.highlights),
        longDescription: toLocalizedText(row.longDescription),
        name: toLocalizedText(row.name),
        origin: toLocalizedText(row.origin),
        shippingInfo: toLocalizedText(row.shippingInfo),
      },
    });
  }

  if (unmatchedCategories.size > 0) {
    console.warn(
      `Product categories not matched to ProductCategory IDs: ${Array.from(unmatchedCategories).sort().join(', ')}`,
    );
  }
}

async function main() {
  const sellerProfileCsvPath = path.resolve(
    process.env.SELLER_PROFILE_CSV_PATH || DEFAULT_SELLER_PROFILE_CSV,
  );
  const productCategoryCsvPath = path.resolve(
    process.env.PRODUCT_CATEGORY_CSV_PATH || DEFAULT_PRODUCT_CATEGORY_CSV,
  );
  const productCsvPath = path.resolve(process.env.PRODUCT_CSV_PATH || DEFAULT_PRODUCT_CSV);

  console.log('Preparing product CSV import seeder...');
  console.log(`SellerProfile CSV: ${sellerProfileCsvPath}`);
  console.log(`ProductCategory CSV: ${productCategoryCsvPath}`);
  console.log(`Product CSV: ${productCsvPath}`);

  const sellerProfiles = (await readCsv(sellerProfileCsvPath)) as SellerProfileCsvRow[];
  const productCategories = (await readCsv(productCategoryCsvPath)) as ProductCategoryCsvRow[];
  const products = (await readCsv(productCsvPath)) as ProductCsvRow[];

  console.log(
    `Loaded ${sellerProfiles.length} seller profiles, ${productCategories.length} product categories and ${products.length} products.`,
  );

  await validateSellerProfiles(sellerProfiles);
  await upsertSellerProfiles(sellerProfiles);
  await upsertProductCategories(productCategories);
  const categoryLookup = buildCategoryLookup(productCategories);
  await validateProductReferences(products, categoryLookup);
  await upsertProducts(products, categoryLookup);

  console.log('Product CSV seeder completed successfully.');
}

main()
  .catch((error) => {
    console.error('Product CSV seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
