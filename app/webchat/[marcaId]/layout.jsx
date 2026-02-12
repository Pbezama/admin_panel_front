/**
 * Layout minimo para Web Chat publico
 * Sin AuthProvider ni ViewProvider - es una pagina publica
 */

export const metadata = {
  title: 'Chat',
  description: 'Chat en linea'
}

export default function WebChatLayout({ children }) {
  return children
}
