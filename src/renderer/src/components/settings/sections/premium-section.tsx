import {
  Zap,
  Infinity,
  Shield,
  Download,
  Globe,
} from 'lucide-react'

export function PremiumSection() {
  const features = [
    {
      icon: Infinity,
      title: 'Histórico Ilimitado',
      description: 'Acesse todas as suas sessões de conversa sem limites de armazenamento'
    },
    {
      icon: Zap,
      title: 'Uso Ilimitado',
      description: 'Processe quantas conversas quiser, sem restrições de requisições'
    },
    {
      icon: Download,
      title: 'Exportação de Dados',
      description: 'Exporte suas sessões em PDF, CSV ou JSON para análise externa'
    },
    {
      icon: Globe,
      title: 'Múltiplos Idiomas',
      description: 'Análise de conversas em diversos idiomas com alta precisão'
    },
    {
      icon: Shield,
      title: 'API Personalizada',
      description: 'Use sua própria API ou endpoints customizados para processamento'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Premium</h2>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-6">O que está incluído no Premium</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-muted/30 border border-border rounded-lg p-4 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-1">{feature.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
