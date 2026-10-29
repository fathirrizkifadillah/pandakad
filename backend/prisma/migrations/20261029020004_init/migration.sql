-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Dosen', 'Mahasiswa');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'Universitas Panda Raya',
    "short_name" TEXT NOT NULL DEFAULT 'UNPANDA',
    "code" TEXT NOT NULL DEFAULT '061032',
    "accreditation" TEXT NOT NULL DEFAULT 'Unggul',
    "faculty_name" TEXT NOT NULL DEFAULT 'Fakultas Teknologi dan Informatika (FTI)',
    "email" TEXT NOT NULL DEFAULT 'baak@unpanda.ac.id',
    "phone" TEXT NOT NULL DEFAULT '(024) 844-5566',
    "address" TEXT NOT NULL DEFAULT 'Kawasan Kampus Terpadu UNPANDA, Jl. Raya Panda Hijau No. 1',
    "logo_url" TEXT NOT NULL DEFAULT '/assets/logo_unpanda.png',
    "active_term_id" TEXT,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "institution_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_identifier_key" ON "users"("identifier");

-- CreateIndex
CREATE INDEX "users_identifier_idx" ON "users"("identifier");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
