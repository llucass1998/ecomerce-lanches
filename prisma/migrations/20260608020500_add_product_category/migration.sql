ALTER TABLE "Product"
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'tradicionais';

UPDATE "Product"
SET "category" = 'bebidas'
WHERE lower("name") LIKE '%refrigerante%'
   OR lower("name") LIKE '%suco%'
   OR lower("name") LIKE '%coca%'
   OR lower("name") LIKE '%fanta%'
   OR lower("name") LIKE '%guaran%'
   OR lower("name") LIKE '%guaravita%';

UPDATE "Product"
SET "category" = 'porcoes'
WHERE lower("name") LIKE '%batata%'
   OR lower("name") LIKE '%frit%';

UPDATE "Product"
SET "category" = 'acai'
WHERE lower("name") LIKE '%acai%'
   OR lower("name") LIKE '%aça%';

UPDATE "Product"
SET "category" = 'frango'
WHERE lower("name") LIKE '%frango%';

UPDATE "Product"
SET "category" = 'picanha'
WHERE lower("name") LIKE '%picanha%';

UPDATE "Product"
SET "category" = 'milkshake'
WHERE lower("name") LIKE '%milk%';

UPDATE "Product"
SET "category" = 'combos'
WHERE lower("name") LIKE '%combo%';

UPDATE "Product"
SET "category" = 'artesanal'
WHERE lower("name") LIKE '%artesanal%';
