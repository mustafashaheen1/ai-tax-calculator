import ClientWrapper from '../components/ClientWrapper'
import './globals.css'

export const metadata = {
  title: 'AI Tax Calculator',
  description: 'Tax calculator with AI advisor'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}