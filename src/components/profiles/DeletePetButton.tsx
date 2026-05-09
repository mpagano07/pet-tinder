'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePet } from '@/app/profiles/actions'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function DeletePetButton({ petId, petName }: { petId: string, petName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setShowConfirm(false)
    setIsDeleting(true)
    try {
      const result = await deletePet(petId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${petName} ha sido eliminado.`)
      }
    } catch (err) {
      toast.error('Error al eliminar la mascota')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="absolute top-2 right-2 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full transition-all z-20 backdrop-blur-sm border border-red-500/20 group-hover:scale-110 active:scale-95 disabled:opacity-50"
        title="Eliminar mascota"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="¿Eliminar mascota?"
        message={`¿Estás seguro de que quieres eliminar a ${petName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isDestructive={true}
      />
    </>
  )
}
