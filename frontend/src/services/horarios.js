export const paraMinutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5))
export const paraHora = (minutos) => `${String(Math.floor(minutos / 60) % 24).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`

/** Horários de uma parada num dia da semana, em ordem e sem repetição. */
export function horariosDoDia(horarios, paradaId, dia) {
  const horas = horarios.filter((h) => h.paradaId === paradaId && h.dias.includes(dia)).map((h) => h.hora.slice(0, 5))
  return [...new Set(horas)].sort()
}

export function proximosHorarios(horarios, paradaId, agora, quantos = 3) {
  const minutos = agora.getHours() * 60 + agora.getMinutes()
  return horariosDoDia(horarios, paradaId, agora.getDay())
    .filter((h) => paraMinutos(h) >= minutos)
    .slice(0, quantos)
}
