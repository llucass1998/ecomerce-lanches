ALTER TABLE "StoreSetting"
ALTER COLUMN "storeName" SET DEFAULT 'Street Foods',
ALTER COLUMN "pixMerchantName" SET DEFAULT 'Street Foods';

UPDATE "StoreSetting"
SET
  "storeName" = 'Street Foods',
  "pixMerchantName" = 'Street Foods'
WHERE id = 1
  AND (
    "storeName" IN ('Lanchonete do Lucas', 'Street Burguer')
    OR "pixMerchantName" IN ('Lanchonete do Lucas', 'Street Burguer')
  );
