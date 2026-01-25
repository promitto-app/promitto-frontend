import { X } from 'lucide-react'

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: React.ReactNode
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message
}: AlertDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-muted border border-border rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-6 text-gray-300 text-sm leading-relaxed">
          {message}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-muted border border-border hover:bg-white/5 text-white py-2.5 rounded-md text-sm font-medium"
        >
          OK
        </button>
      </div>
    </div>
  )
}
