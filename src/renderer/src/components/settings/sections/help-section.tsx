import { MessageCircle } from 'lucide-react'

interface CardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  buttonText: string
  onButtonClick?: () => void
}

function Card({ icon: Icon, title, description, buttonText, onButtonClick }: CardProps) {
  return (
    <div className="bg-muted border border-border rounded-lg p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 bg-white/5 rounded-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        onClick={onButtonClick}
        className="w-full bg-muted border border-border hover:bg-white/5 text-white py-2.5 px-4 rounded-md transition-colors text-sm font-medium"
      >
        {buttonText}
      </button>
    </div>
  )
}

export function HelpSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Ajuda</h2>

      <div className="bg-muted border border-border rounded-lg p-5">
        <h3 className="text-white font-semibold mb-2">Sobre</h3>
        <p className="text-gray-400 text-sm">Versão: 1.0.0</p>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-4">Comunidade</h3>
        <Card
          icon={MessageCircle}
          title="Discord"
          description="Junte-se à nossa comunidade no Discord para obter ajuda, compartilhar feedback e conectar-se com outros usuários."
          buttonText="Entrar no Discord"
          onButtonClick={() => console.log('Abrir Discord')}
        />
      </div>
    </div>
  )
}
