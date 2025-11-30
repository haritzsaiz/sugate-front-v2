import {
  LayoutDashboard,
  FolderKanban,
  Users,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Menu Principal',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Clientes',
          url: '/clientes',
          icon: Users,
        },
        {
          title: 'Proyectos',
          url: '/proyectos',
          icon: FolderKanban,
        },
      ],
    },
  ],
}
