ALTER TABLE "StoreSetting"
ALTER COLUMN "storeName" SET DEFAULT 'Street Burguer',
ALTER COLUMN "pixMerchantName" SET DEFAULT 'Street Burguer';

UPDATE "StoreSetting"
SET
  "storeName" = 'Street Burguer',
  "pixMerchantName" = 'Street Burguer'
WHERE id = 1
  AND (
    "storeName" = 'Lanchonete do Lucas'
    OR "pixMerchantName" = 'Lanchonete do Lucas'
  );
