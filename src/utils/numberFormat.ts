function readNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumber(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '-';
  return Number.parseFloat(value.toFixed(digits)).toString();
}

function formatMoney(value: number, symbol: string) {
  if (!Number.isFinite(value)) return '-';
  return `${symbol}${value.toFixed(2)}`;
}

export { formatMoney, formatNumber, readNumber };
