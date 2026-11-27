function Icone({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconeMapa = () => (
  <Icone>
    <path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13.5M15 6.5V20" />
  </Icone>
)
export const IconeLinhas = () => (
  <Icone>
    <circle cx="6" cy="18.5" r="2.5" />
    <circle cx="18" cy="5.5" r="2.5" />
    <path d="M8.5 18.5H15a3.25 3.25 0 0 0 0-6.5H9a3.25 3.25 0 0 1 0-6.5h6.5" />
  </Icone>
)
export const IconeEstrela = ({ cheia = false }) => (
  <Icone fill={cheia ? 'currentColor' : 'none'}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
  </Icone>
)
export const IconePessoa = () => (
  <Icone>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </Icone>
)
export const IconeMira = () => (
  <Icone>
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
  </Icone>
)
export const IconeCarrinho = () => (
  <Icone>
    <path d="M4 16V9a2 2 0 0 1 2-2h9l5 5v4h-2M4 16h2m4 0h4M4 11h14M10 7v4" />
    <circle cx="8" cy="17" r="2" />
    <circle cx="16" cy="17" r="2" />
  </Icone>
)
