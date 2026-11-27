import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { memo, useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router'

import { BotaoFavorito } from './BotaoFavorito'
import { nomeEstado } from './EstadoVeiculo'

function Enquadrar({ linhas, linhaSelecionada, posicao }) {
  const mapa = useMap()
  const alvo = linhaSelecionada ? linhas.filter((l) => l.id === linhaSelecionada) : linhas
  const chave = alvo.map((l) => l.id).join()

  useEffect(() => {
    const pontos = alvo.flatMap((l) => l.trajeto)
    if (pontos.length) mapa.fitBounds(L.latLngBounds(pontos), { padding: [36, 36], maxZoom: 18 })
    // Só reenquadra quando muda o conjunto de linhas em foco.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, mapa])

  useEffect(() => {
    if (posicao) mapa.setView(posicao, Math.max(mapa.getZoom(), 16))
  }, [posicao, mapa])

  // Evita que os veículos "deslizem" enquanto o mapa muda de escala.
  useEffect(() => {
    const caixa = mapa.getContainer()
    const parar = () => caixa.classList.add('sem-deslize')
    const soltar = () => requestAnimationFrame(() => caixa.classList.remove('sem-deslize'))
    mapa.on('zoomstart', parar).on('zoomend', soltar)
    const observador = new ResizeObserver(() => mapa.invalidateSize())
    observador.observe(caixa)
    return () => {
      mapa.off('zoomstart', parar).off('zoomend', soltar)
      observador.disconnect()
    }
  }, [mapa])

  return null
}

const MarcadorVeiculo = memo(function MarcadorVeiculo({ veiculo, codigo, cor, apagado, aoSelecionar }) {
  const icone = useMemo(
    () =>
      L.divIcon({
        className: 'veiculo',
        html: `<span class="veiculo-placa veiculo-${veiculo.estado}" style="--cor:${/^#[0-9a-f]{6}$/i.test(cor) ? cor : '#13302B'}">${codigo.replace(/[^\w-]/g, '')}</span>`,
        iconSize: [48, 30],
        iconAnchor: [24, 15],
      }),
    [veiculo.estado, codigo, cor],
  )
  const rotulo = `${veiculo.nome} ${codigo}: ${nomeEstado[veiculo.estado]}`
  return (
    <Marker
      position={[veiculo.lat, veiculo.lng]}
      icon={icone}
      title={rotulo}
      alt={rotulo}
      opacity={apagado ? 0.45 : 1}
      zIndexOffset={apagado ? 500 : 1000}
      eventHandlers={{ click: () => aoSelecionar(veiculo.linhaId), keypress: () => aoSelecionar(veiculo.linhaId) }}
    />
  )
})

export default function MapaRede({ linhas, veiculos, linhaSelecionada, posicao, aoSelecionar }) {
  const paradas = useMemo(() => {
    const mapa = new Map()
    for (const linha of linhas) {
      for (const p of linha.paradas) {
        const existente = mapa.get(p.id)
        if (existente) existente.linhas.push(linha)
        else mapa.set(p.id, { ...p, linhas: [linha] })
      }
    }
    return [...mapa.values()]
  }, [linhas])

  // A linha escolhida é desenhada por último, por cima das outras.
  const ordenadas = [...linhas].sort((a, b) => Number(a.id === linhaSelecionada) - Number(b.id === linhaSelecionada))

  return (
    <MapContainer center={[-3.769, -38.479]} zoom={14} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Enquadrar linhas={linhas} linhaSelecionada={linhaSelecionada} posicao={posicao} />
      {ordenadas.map((linha) => {
        const apagada = linhaSelecionada !== null && linha.id !== linhaSelecionada
        return (
          <Polyline
            key={`${linha.id}-${linhaSelecionada ?? ''}`}
            positions={linha.trajeto}
            pathOptions={{ color: linha.cor, weight: apagada ? 4 : 6, opacity: apagada ? 0.3 : 0.9 }}
            eventHandlers={{ click: () => aoSelecionar(linha.id) }}
          />
        )
      })}
      {paradas.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={7}
          pathOptions={{ color: '#13302B', weight: 3, fillColor: '#fff', fillOpacity: 1 }}
        >
          <Popup>
            <div className="min-w-48">
              <div className="flex items-start justify-between gap-2">
                <strong className="text-base">{p.nome}</strong>
                <BotaoFavorito alvo={{ paradaId: p.id }} nome={p.nome} />
              </div>
              <ul className="mt-1 space-y-1">
                {p.linhas.map((l) => (
                  <li key={l.id}>
                    <Link to={`/linhas/${l.id}?parada=${p.id}`}>Horários da linha {l.codigo}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {veiculos.map((v) => {
        const linha = linhas.find((l) => l.id === v.linhaId)
        if (!linha) return null
        return (
          <MarcadorVeiculo
            key={v.id}
            veiculo={v}
            codigo={linha.codigo}
            cor={linha.cor}
            apagado={linhaSelecionada !== null && linha.id !== linhaSelecionada}
            aoSelecionar={aoSelecionar}
          />
        )
      })}
      {posicao && (
        <CircleMarker center={posicao} radius={9} pathOptions={{ color: '#fff', weight: 4, fillColor: '#1D5FD1', fillOpacity: 1 }}>
          <Popup>Você está aqui</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  )
}
