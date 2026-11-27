import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Carregando } from './componentes/Estados'
import { Layout } from './componentes/Layout'
import Avaliar from './telas/Avaliar'
import Cadastro from './telas/Cadastro'
import Chamar from './telas/Chamar'
import Entrar from './telas/Entrar'
import Favoritos from './telas/Favoritos'
import Inicio from './telas/Inicio'
import LinhaDetalhe from './telas/LinhaDetalhe'
import Linhas from './telas/Linhas'
import Motorista from './telas/Motorista'
import NaoEncontrada from './telas/NaoEncontrada'
import Privacidade from './telas/Privacidade'
import Sobre from './telas/Sobre'

// A biblioteca de mapa só é baixada por quem abre o mapa.
const Mapa = lazy(() => import('./telas/Mapa'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route
          path="mapa"
          element={
            <Suspense fallback={<div className="margem"><Carregando texto="Abrindo o mapa" /></div>}>
              <Mapa />
            </Suspense>
          }
        />
        <Route path="linhas" element={<Linhas />} />
        <Route path="linhas/:id" element={<LinhaDetalhe />} />
        <Route path="chamar" element={<Chamar />} />
        <Route path="motorista" element={<Motorista />} />
        <Route path="avaliar" element={<Avaliar />} />
        <Route path="favoritos" element={<Favoritos />} />
        <Route path="entrar" element={<Entrar />} />
        <Route path="cadastro" element={<Cadastro />} />
        <Route path="sobre" element={<Sobre />} />
        <Route path="privacidade" element={<Privacidade />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
