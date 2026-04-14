-- AlterTable User
ALTER TABLE "User" ADD COLUMN "address" TEXT,
ADD COLUMN "anniversary" TEXT,
ADD COLUMN "dob" TEXT;

-- ✅ Safe ENUM: OwnerType
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OwnerType') THEN
    CREATE TYPE "OwnerType" AS ENUM ('ADMIN', 'TEMPLE', 'SELLER');
  END IF;
END $$;

-- ✅ Safe ENUM: LedgerType
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LedgerType') THEN
    CREATE TYPE "LedgerType" AS ENUM ('MARKETPLACE_EARNING', 'POOJA_EARNING', 'DONATION_EARNING', 'WITHDRAWAL');
  END IF;
END $$;

-- ✅ Safe ENUM: LedgerStatus
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LedgerStatus') THEN
    CREATE TYPE "LedgerStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
  END IF;
END $$;

-- ✅ Safe ENUM: WithdrawalStatus
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WithdrawalStatus') THEN
    CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');
  END IF;
END $$;

-- ✅ Safe ENUM: BookingStatus
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingStatus') THEN
    CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'PENDING');
  END IF;
END $$;

-- CreateTable Donation
CREATE TABLE IF NOT EXISTS "Donation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "templeId" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorPhone" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "razorpayOrderId" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "is80GRequired" BOOLEAN NOT NULL DEFAULT false,
    "panNumber" TEXT,
    "address" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable StaffMember
CREATE TABLE IF NOT EXISTS "StaffMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable Role
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerType" "OwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable Permission
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "applicableTo" "OwnerType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable RolePermission
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable StaffRole
CREATE TABLE IF NOT EXISTS "StaffRole" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable FCMToken
CREATE TABLE IF NOT EXISTS "FCMToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (IF NOT EXISTS for safety)
CREATE UNIQUE INDEX IF NOT EXISTS "Donation_razorpayOrderId_key" ON "Donation"("razorpayOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "StaffMember_email_key" ON "StaffMember"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_ownerType_ownerId_key" ON "Role"("name", "ownerType", "ownerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_key_key" ON "Permission"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");
CREATE UNIQUE INDEX IF NOT EXISTS "StaffRole_staffId_roleId_key" ON "StaffRole"("staffId", "roleId");
CREATE UNIQUE INDEX IF NOT EXISTS "FCMToken_token_key" ON "FCMToken"("token");
CREATE INDEX IF NOT EXISTS "Notification_userId_userType_idx" ON "Notification"("userId", "userType");

-- AddForeignKey (with IF NOT EXISTS check via DO blocks)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Donation_templeId_fkey'
  ) THEN
    ALTER TABLE "Donation" ADD CONSTRAINT "Donation_templeId_fkey" 
    FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Donation_userId_fkey'
  ) THEN
    ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'RolePermission_roleId_fkey'
  ) THEN
    ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" 
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'RolePermission_permissionId_fkey'
  ) THEN
    ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" 
    FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'StaffRole_staffId_fkey'
  ) THEN
    ALTER TABLE "StaffRole" ADD CONSTRAINT "StaffRole_staffId_fkey" 
    FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'StaffRole_roleId_fkey'
  ) THEN
    ALTER TABLE "StaffRole" ADD CONSTRAINT "StaffRole_roleId_fkey" 
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;