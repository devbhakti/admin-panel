import { PrismaClient, UserRole, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import ExcelJS from 'exceljs';
import path from 'path';

const prisma = new PrismaClient();

const DEFAULT_CSV_DIR = path.resolve(process.cwd(), 'prisma', 'csv');
const DEFAULT_TEMPLE_CSV = path.join(DEFAULT_CSV_DIR, 'Temple.csv');
const DEFAULT_POOJA_CATEGORY_CSV = path.join(DEFAULT_CSV_DIR, 'PoojaCategory.csv');
const DEFAULT_POOJA_CSV = path.join(DEFAULT_CSV_DIR, 'Pooja.csv');
const DEFAULT_USER_CSV = path.join(DEFAULT_CSV_DIR, 'User.csv');
const DEFAULT_PLACEHOLDER_PASSWORD = 'ChangeMe123!';

type CsvRow = Record<string, string>;

type TempleCsvRow = {
  id: string;
  name: string;
  location: string;
  fullAddress: string;
  description: string;
  history: string;
  image: string;
  liveUrl: string;
  channelId: string;
  heroImages: string;
  gallery: string;
  rating: string;
  reviewsCount: string;
  category: string;
  liveStatus: string;
  openTime: string;
  phone: string;
  website: string;
  mapUrl: string;
  viewers: string;
  isLive: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  poojaCommissionRate: string;
  productCommissionRate: string;
  templeId: string;
  slug: string;
  isActive: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;
  subdomain: string;
  urlType: string;
  pickupLocation: string;
  isPrimaryLive: string;
  operatingHours: string;
};

type PoojaCategoryCsvRow = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

type PoojaCsvRow = {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  time: string;
  image: string;
  about: string;
  benefits: string;
  bullets: string;
  process: string;
  processSteps: string;
  isMaster: string;
  masterPoojaId: string;
  templeId: string;
  templeDetails: string;
  packages: string;
  faqs: string;
  reviews: string;
  createdAt: string;
  updatedAt: string;
  status: string;
};

type UserCsvRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  isActive: string;
  isVerified: string;
  createdAt: string;
  updatedAt: string;
  otp: string;
  otpExpires: string;
  profileImage: string;
  gothra: string;
  kuldevi: string;
  kuldevta: string;
  anniversary: string;
  dob: string;
  address: string;
  nativePlace: string;
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

    const hasAnyValue = Object.values(record).some((value) => value !== '');
    if (hasAnyValue) {
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

function parseJson(value: string): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseStringArray(value: string): string[] {
  if (!value) {
    return [];
  }

  const parsed = parseJson(value);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => valueToString(item)).filter(Boolean);
  }

  return [];
}

function parseJsonValue(value: string): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseJson(value);
  if (parsed === null) {
    return undefined;
  }

  return parsed as Prisma.InputJsonValue;
}

function toLocalizedText(value: string): Prisma.InputJsonValue | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseJson(value);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Prisma.InputJsonValue;
  }

  return { en: value } as Prisma.InputJsonValue;
}

function toLocalizedArray(value: string): Prisma.InputJsonValue | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseJson(value);
  if (Array.isArray(parsed)) {
    return { en: parsed.map((item) => valueToString(item)).filter(Boolean) } as Prisma.InputJsonValue;
  }

  if (parsed && typeof parsed === 'object') {
    return parsed as Prisma.InputJsonValue;
  }

  return { en: [value] } as Prisma.InputJsonValue;
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

function uniqueNameSlug(name: string, id: string, usedSlugs: Set<string>): string {
  const baseSlug = slugifyName(name) || id.toLowerCase();
  let candidate = baseSlug;

  if (!usedSlugs.has(candidate)) {
    usedSlugs.add(candidate);
    return candidate;
  }

  let counter = 2;
  while (usedSlugs.has(`${baseSlug}-${counter}`)) {
    counter += 1;
  }

  candidate = `${baseSlug}-${counter}`;
  usedSlugs.add(candidate);
  return candidate;
}

function buildTempleAdminEmail(row: TempleCsvRow): string {
  const slug = slugifyName(row.slug || row.subdomain || row.name || row.id) || row.id.toLowerCase();
  return `${slug}.${row.userId.toLowerCase()}@import.devbhakti.local`;
}

async function upsertTempleUsers(temples: TempleCsvRow[]) {
  const hashedPassword = await bcrypt.hash(
    process.env.CSV_IMPORT_PLACEHOLDER_PASSWORD || DEFAULT_PLACEHOLDER_PASSWORD,
    10,
  );

  for (const row of temples) {
    if (!row.userId) {
      throw new Error(`Temple ${row.id} is missing userId. Temple import cannot continue.`);
    }

    const createdAt = parseDate(row.createdAt) ?? new Date();
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;
    const email = buildTempleAdminEmail(row);

    await prisma.user.upsert({
      where: { id: row.userId },
      update: {
        name: `${row.name} Admin`,
        email,
        password: hashedPassword,
        phone: row.phone || undefined,
        role: UserRole.INSTITUTION,
        isVerified: true,
        isActive: parseBoolean(row.isActive, true),
        updatedAt,
      },
      create: {
        id: row.userId,
        name: `${row.name} Admin`,
        email,
        password: hashedPassword,
        phone: row.phone || undefined,
        role: UserRole.INSTITUTION,
        isVerified: true,
        isActive: parseBoolean(row.isActive, true),
        createdAt,
        updatedAt,
      },
    });
  }
}

function parseUserRole(value: string): UserRole {
  if (value === 'ADMIN' || value === 'DEVOTEE' || value === 'INSTITUTION' || value === 'SELLER') {
    return value;
  }

  throw new Error(`Unsupported user role in CSV: ${value}`);
}

async function upsertUsers(users: UserCsvRow[]) {
  const seenPhoneRole = new Set<string>();
  const seenEmailRole = new Set<string>();
  let duplicatePhoneRoleCount = 0;
  let duplicateEmailRoleCount = 0;

  for (const row of users) {
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;
    const otpExpires = parseDate(row.otpExpires);
    const phoneKey = row.phone ? `${row.role}::${row.phone}` : '';
    const emailKey = row.email ? `${row.role}::${row.email.toLowerCase()}` : '';
    const safePhone =
      phoneKey && seenPhoneRole.has(phoneKey)
        ? undefined
        : (row.phone || undefined);
    const safeEmail =
      emailKey && seenEmailRole.has(emailKey)
        ? undefined
        : (row.email || undefined);

    if (phoneKey) {
      if (seenPhoneRole.has(phoneKey)) {
        duplicatePhoneRoleCount += 1;
      } else {
        seenPhoneRole.add(phoneKey);
      }
    }

    if (emailKey) {
      if (seenEmailRole.has(emailKey)) {
        duplicateEmailRoleCount += 1;
      } else {
        seenEmailRole.add(emailKey);
      }
    }

    await prisma.user.upsert({
      where: { id: row.id },
      update: {
        name: row.name || undefined,
        email: safeEmail,
        password: row.password || undefined,
        phone: safePhone,
        role: parseUserRole(row.role),
        isActive: parseBoolean(row.isActive, true),
        isVerified: parseBoolean(row.isVerified, false),
        otp: row.otp || undefined,
        otpExpires,
        profileImage: row.profileImage || undefined,
        gothra: row.gothra || undefined,
        kuldevi: row.kuldevi || undefined,
        kuldevta: row.kuldevta || undefined,
        anniversary: row.anniversary || undefined,
        dob: row.dob || undefined,
        address: row.address || undefined,
        nativePlace: row.nativePlace || undefined,
        updatedAt,
      },
      create: {
        id: row.id,
        name: row.name || undefined,
        email: safeEmail,
        password: row.password || undefined,
        phone: safePhone,
        role: parseUserRole(row.role),
        isActive: parseBoolean(row.isActive, true),
        isVerified: parseBoolean(row.isVerified, false),
        createdAt,
        updatedAt,
        otp: row.otp || undefined,
        otpExpires,
        profileImage: row.profileImage || undefined,
        gothra: row.gothra || undefined,
        kuldevi: row.kuldevi || undefined,
        kuldevta: row.kuldevta || undefined,
        anniversary: row.anniversary || undefined,
        dob: row.dob || undefined,
        address: row.address || undefined,
        nativePlace: row.nativePlace || undefined,
      },
    });
  }

  if (duplicatePhoneRoleCount > 0 || duplicateEmailRoleCount > 0) {
    console.warn(
      `User CSV duplicates adjusted for schema constraints. phone+role: ${duplicatePhoneRoleCount}, email+role: ${duplicateEmailRoleCount}`,
    );
  }
}

async function upsertPoojaCategories(categories: PoojaCategoryCsvRow[]) {
  const usedSlugs = new Set<string>();
  const existingCategories = await prisma.poojaCategory.findMany({
    select: { id: true, nameSlug: true },
  });
  const existingSlugById = new Map(existingCategories.map((item) => [item.id, item.nameSlug]));

  for (const existing of existingCategories) {
    usedSlugs.add(existing.nameSlug);
  }

  for (const row of categories) {
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const nameSlug = existingSlugById.get(row.id) || uniqueNameSlug(row.name, row.id, usedSlugs);

    await prisma.poojaCategory.upsert({
      where: { id: row.id },
      update: {
        name: { en: row.name },
        nameSlug,
        status: row.status || 'APPROVED',
      },
      create: {
        id: row.id,
        name: { en: row.name },
        nameSlug,
        status: row.status || 'APPROVED',
        createdAt,
      },
    });
  }
}

async function upsertTemples(temples: TempleCsvRow[]) {
  for (const row of temples) {
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;

    await prisma.temple.upsert({
      where: { id: row.id },
      update: {
        image: row.image || undefined,
        liveUrl: row.liveUrl || undefined,
        channelId: row.channelId || undefined,
        heroImages: parseStringArray(row.heroImages),
        gallery: parseStringArray(row.gallery),
        rating: parseNumber(row.rating, 0),
        reviewsCount: Math.trunc(parseNumber(row.reviewsCount, 0)),
        liveStatus: parseBoolean(row.liveStatus, false),
        openTime: row.openTime || undefined,
        phone: row.phone || undefined,
        website: row.website || undefined,
        mapUrl: row.mapUrl || undefined,
        viewers: row.viewers || undefined,
        isLive: parseBoolean(row.isLive, false),
        userId: row.userId,
        poojaCommissionRate: parseNumber(row.poojaCommissionRate, 5),
        productCommissionRate: parseNumber(row.productCommissionRate, 10),
        templeId: row.templeId || undefined,
        slug: row.slug || undefined,
        isActive: parseBoolean(row.isActive, true),
        accountHolderName: row.accountHolderName || undefined,
        accountNumber: row.accountNumber || undefined,
        bankName: row.bankName || undefined,
        ifscCode: row.ifscCode || undefined,
        upiId: row.upiId || undefined,
        subdomain: row.subdomain || undefined,
        urlType: row.urlType || 'slug',
        isPrimaryLive: parseBoolean(row.isPrimaryLive, false),
        operatingHours: parseJsonValue(row.operatingHours),
        category: toLocalizedText(row.category),
        description: toLocalizedText(row.description),
        fullAddress: toLocalizedText(row.fullAddress),
        history: toLocalizedText(row.history),
        location: toLocalizedText(row.location),
        name: toLocalizedText(row.name),
        pickupLocation: toLocalizedText(row.pickupLocation),
        updatedAt,
      },
      create: {
        id: row.id,
        image: row.image || undefined,
        liveUrl: row.liveUrl || undefined,
        channelId: row.channelId || undefined,
        heroImages: parseStringArray(row.heroImages),
        youtubeLinks: [],
        gallery: parseStringArray(row.gallery),
        rating: parseNumber(row.rating, 0),
        reviewsCount: Math.trunc(parseNumber(row.reviewsCount, 0)),
        liveStatus: parseBoolean(row.liveStatus, false),
        openTime: row.openTime || undefined,
        phone: row.phone || undefined,
        website: row.website || undefined,
        mapUrl: row.mapUrl || undefined,
        viewers: row.viewers || undefined,
        isLive: parseBoolean(row.isLive, false),
        userId: row.userId,
        createdAt,
        updatedAt,
        poojaCommissionRate: parseNumber(row.poojaCommissionRate, 5),
        productCommissionRate: parseNumber(row.productCommissionRate, 10),
        templeId: row.templeId || undefined,
        slug: row.slug || undefined,
        isActive: parseBoolean(row.isActive, true),
        accountHolderName: row.accountHolderName || undefined,
        accountNumber: row.accountNumber || undefined,
        bankName: row.bankName || undefined,
        ifscCode: row.ifscCode || undefined,
        upiId: row.upiId || undefined,
        subdomain: row.subdomain || undefined,
        urlType: row.urlType || 'slug',
        isPrimaryLive: parseBoolean(row.isPrimaryLive, false),
        operatingHours: parseJsonValue(row.operatingHours),
        category: toLocalizedText(row.category),
        description: toLocalizedText(row.description),
        fullAddress: toLocalizedText(row.fullAddress),
        history: toLocalizedText(row.history),
        location: toLocalizedText(row.location),
        name: toLocalizedText(row.name),
        pickupLocation: toLocalizedText(row.pickupLocation),
      },
    });
  }
}

function sortPoojasForImport(rows: PoojaCsvRow[]): PoojaCsvRow[] {
  return [...rows].sort((a, b) => {
    const aIsMaster = parseBoolean(a.isMaster, false);
    const bIsMaster = parseBoolean(b.isMaster, false);

    if (aIsMaster !== bIsMaster) {
      return aIsMaster ? -1 : 1;
    }

    if (!a.masterPoojaId && b.masterPoojaId) {
      return -1;
    }

    if (a.masterPoojaId && !b.masterPoojaId) {
      return 1;
    }

    return 0;
  });
}

function buildCategoryLookup(categories: PoojaCategoryCsvRow[]): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const row of categories) {
    const normalizedName = normalizeLookup(row.name);
    if (normalizedName) {
      lookup.set(normalizedName, row.id);
      lookup.set(slugifyName(row.name), row.id);
    }
  }

  return lookup;
}

async function upsertPoojas(poojas: PoojaCsvRow[], poojaCategories: PoojaCategoryCsvRow[]) {
  const categoryLookup = buildCategoryLookup(poojaCategories);
  const unmatchedCategories = new Set<string>();

  for (const row of sortPoojasForImport(poojas)) {
    const createdAt = parseDate(row.createdAt) ?? new Date();
    const updatedAt = parseDate(row.updatedAt) ?? createdAt;
    const rawCategory = valueToString(row.category);
    const normalizedCategory = normalizeLookup(rawCategory);
    const categoryId =
      categoryLookup.get(normalizedCategory) ||
      categoryLookup.get(slugifyName(rawCategory)) ||
      undefined;

    if (rawCategory && !categoryId) {
      unmatchedCategories.add(rawCategory);
    }

    await prisma.pooja.upsert({
      where: { id: row.id },
      update: {
        price: parseNumber(row.price, 0),
        time: row.time || '',
        image: row.image || undefined,
        processSteps: toLocalizedArray(row.processSteps),
        isMaster: parseBoolean(row.isMaster, false),
        masterPoojaId: row.masterPoojaId || undefined,
        templeId: row.templeId || undefined,
        packages: parseJsonValue(row.packages),
        faqs: parseJsonValue(row.faqs),
        reviews: parseJsonValue(row.reviews),
        status: parseBoolean(row.status, true),
        about: toLocalizedText(row.about),
        benefits: toLocalizedArray(row.benefits),
        bullets: toLocalizedArray(row.bullets),
        category: toLocalizedText(row.category),
        categoryId,
        categoryIds: categoryId ? [categoryId] : [],
        description: toLocalizedArray(row.description),
        duration: toLocalizedText(row.duration),
        name: toLocalizedText(row.name),
        process: toLocalizedText(row.process),
        templeDetails: toLocalizedText(row.templeDetails),
        updatedAt,
      },
      create: {
        id: row.id,
        price: parseNumber(row.price, 0),
        time: row.time || '',
        image: row.image || undefined,
        processSteps: toLocalizedArray(row.processSteps),
        isMaster: parseBoolean(row.isMaster, false),
        masterPoojaId: row.masterPoojaId || undefined,
        templeId: row.templeId || undefined,
        packages: parseJsonValue(row.packages),
        faqs: parseJsonValue(row.faqs),
        reviews: parseJsonValue(row.reviews),
        createdAt,
        updatedAt,
        status: parseBoolean(row.status, true),
        about: toLocalizedText(row.about),
        benefits: toLocalizedArray(row.benefits),
        bullets: toLocalizedArray(row.bullets),
        category: toLocalizedText(row.category),
        categoryId,
        categoryIds: categoryId ? [categoryId] : [],
        description: toLocalizedArray(row.description),
        duration: toLocalizedText(row.duration),
        name: toLocalizedText(row.name),
        process: toLocalizedText(row.process),
        templeDetails: toLocalizedText(row.templeDetails),
      },
    });
  }

  if (unmatchedCategories.size > 0) {
    console.warn(
      `Pooja categories not matched to PoojaCategory IDs: ${Array.from(unmatchedCategories)
        .sort()
        .join(', ')}`,
    );
  }
}

async function main() {
  const templeCsvPath = path.resolve(process.env.TEMPLE_CSV_PATH || DEFAULT_TEMPLE_CSV);
  const poojaCategoryCsvPath = path.resolve(process.env.POOJA_CATEGORY_CSV_PATH || DEFAULT_POOJA_CATEGORY_CSV);
  const poojaCsvPath = path.resolve(process.env.POOJA_CSV_PATH || DEFAULT_POOJA_CSV);
  const userCsvPath = path.resolve(process.env.USER_CSV_PATH || DEFAULT_USER_CSV);

  console.log('Preparing CSV import seeder...');
  console.log(`User CSV: ${userCsvPath}`);
  console.log(`Temple CSV: ${templeCsvPath}`);
  console.log(`PoojaCategory CSV: ${poojaCategoryCsvPath}`);
  console.log(`Pooja CSV: ${poojaCsvPath}`);

  const users = (await readCsv(userCsvPath)) as UserCsvRow[];
  const temples = (await readCsv(templeCsvPath)) as TempleCsvRow[];
  const poojaCategories = (await readCsv(poojaCategoryCsvPath)) as PoojaCategoryCsvRow[];
  const poojas = (await readCsv(poojaCsvPath)) as PoojaCsvRow[];

  console.log(`Loaded ${users.length} users, ${temples.length} temples, ${poojaCategories.length} pooja categories, ${poojas.length} poojas.`);

  if (users.length > 0) {
    await upsertUsers(users);
  } else {
    await upsertTempleUsers(temples);
  }
  await upsertPoojaCategories(poojaCategories);
  await upsertTemples(temples);
  await upsertPoojas(poojas, poojaCategories);

  const adminCount = await prisma.user.count({
    where: { role: UserRole.ADMIN },
  });

  console.log('CSV seeding completed successfully.');
  console.log(`Admin users present: ${adminCount}`);
  console.log(`Placeholder temple admin password: ${process.env.CSV_IMPORT_PLACEHOLDER_PASSWORD || DEFAULT_PLACEHOLDER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('CSV seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
