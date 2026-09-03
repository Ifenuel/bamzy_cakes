export function formatNaira(amount = 0) {
  const n = Number(amount) || 0
  return '\u20A6' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 })
}