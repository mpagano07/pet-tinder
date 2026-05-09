'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteMatch } from '@/app/matches/actions'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function DeleteMatchButton({ matchId }: { matchId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteMatch(matchId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Conversación eliminada')
      }
    } catch (err) {
      toast.error('Error al eliminar la conversación')
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsModalOpen(true)
        }}
        className="absolute top-1/2 -right-4 -translate-y-1/2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all opacity-0 group-hover:opacity-100 group-hover:right-2"
        title="Eliminar conversación"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar conversación?"
        message="Esta acción borrará todos los mensajes y no se puede deshacer."
        confirmText={isDeleting ? 'Eliminando...' : 'Eliminar'}
        isDestructive={true}
      />
    </>
  )
}
