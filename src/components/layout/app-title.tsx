import { Link } from '@tanstack/react-router'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='gap-2 py-0 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <div>
            <Link
              to='/'
              onClick={() => setOpenMobile(false)}
              className='flex items-center gap-2'
            >
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary'>
                <img
                  src='/images/sugate.png'
                  alt='Sugate'
                  className='size-7 object-contain'
                />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-bold'>Sugate</span>
                <span className='truncate text-xs'>Gestión de proyectos</span>
              </div>
            </Link>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
