import { PanelLeftIcon } from 'lucide-react'
import { useLayout } from '@/context/layout-provider'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { toggleSidebar } = useSidebar()
  
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-start gap-2 mb-2'
          onClick={toggleSidebar}
        >
          <PanelLeftIcon className='h-4 w-4' />
          <span className='group-data-[collapsible=icon]:hidden'>Colapsar</span>
        </Button>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
