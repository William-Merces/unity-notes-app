-- add_required_fields.sql
-- Primeiro adiciona as colunas como nullable
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "wardId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Atualiza os registros existentes com valores padrão
UPDATE "Lesson" SET "wardId" = (SELECT id FROM "Ward" LIMIT 1) WHERE "wardId" IS NULL;
UPDATE "User" SET "password" = '$2a$10$defaultpasswordtobeupdated' WHERE "password" IS NULL;

-- Torna as colunas NOT NULL após preenchê-las
ALTER TABLE "Lesson" ALTER COLUMN "wardId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;