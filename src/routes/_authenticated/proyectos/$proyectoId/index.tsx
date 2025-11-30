import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/proyectos/$proyectoId/resumen',
      params: { proyectoId: params.proyectoId },
    })
  },
})
