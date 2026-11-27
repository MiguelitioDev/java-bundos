export function distanciaMetros(a, b) {
  const rad = Math.PI / 180
  const dLat = (b[0] - a[0]) * rad
  const dLng = (b[1] - a[1]) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2
  return 12_742_000 * Math.asin(Math.sqrt(h))
}

export function paradaMaisProxima(posicao, paradas) {
  let melhor = null
  for (const parada of paradas) {
    const metros = distanciaMetros(posicao, [parada.lat, parada.lng])
    if (!melhor || metros < melhor.metros) melhor = { parada, metros }
  }
  return melhor
}

/** Caminhada a cerca de 4,8 km/h. */
export const minutosAPe = (metros) => Math.max(1, Math.round(metros / 80))
