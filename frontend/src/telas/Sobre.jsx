import { Link } from 'react-router'
import { PaginaTexto } from '../componentes/PaginaTexto'
import { servico } from '../services'

export default function Sobre() {
  return (
    <PaginaTexto
      titulo="Sobre o UniRota"
      blocos={[
        {
          titulo: 'O problema',
          corpo: (
            <p>
              Hoje, saber onde está o transporte depende de perguntar num grupo de mensagens e esperar alguém responder. O UniRota junta
              essa informação num mapa e permite chamar o carrinho.
            </p>
          ),
        },
        {
          titulo: servico.modoDemonstracao ? 'O que é de verdade' : 'Versão em teste',
          corpo: servico.modoDemonstracao ? (
            <p>
              O mapa de ruas é real. Paradas, linhas, veículos, horários, trajetos e previsões são fictícios, criados para demonstrar o
              projeto. Nesta versão não há rastreamento por GPS.
            </p>
          ) : (
            <p>
              As posições vêm do celular de motoristas participantes. Quando ninguém está enviando, o mapa fica sem veículos. Previsões são
              estimativas.
            </p>
          ),
        },
        {
          titulo: 'Quem fez',
          corpo: (
            <p>
              Pedro Miguel (front-end), Maria Rafaele (banco de dados) e Ricardo Augusto (back-end), na disciplina de Desenvolvimento para
              Plataformas Web.
            </p>
          ),
        },
        {
          titulo: 'Créditos e vínculos',
          corpo: (
            <>
              <p>
                Mapa © <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>, licença ODbL, exibido com
                Leaflet. Fonte Overpass, licença SIL OFL.
              </p>
              <p>
                Unifor, McDonald's e os shoppings citados são só referência de lugar. Pertencem aos seus titulares, que não têm vínculo com
                o projeto. Leia a <Link to="/privacidade">política de privacidade</Link>.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
