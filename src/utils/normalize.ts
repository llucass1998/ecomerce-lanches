// Normaliza email: remove espacos e deixa tudo minusculo.
export function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

// Normaliza textos comuns: remove espacos antes/depois e evita valores invalidos.
export function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

// Converte preco/taxa para dinheiro no formato 10.50.
export function parseMoney(value: unknown) {
  const numberValue =
    typeof value === 'number' ? value : Number(String(value).replace(',', '.'));

  // Nao aceita valores negativos, vazios ou que nao sejam numero.
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }

  // Prisma aceita decimal como string, entao retornamos sempre com 2 casas.
  return numberValue.toFixed(2);
}
