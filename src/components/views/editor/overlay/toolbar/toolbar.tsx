import { Menubar } from '@/components/ui/menubar'
import { AddEdgeToggle } from './components/add-edge-toggle'
import { AddNodeButton } from './components/add-node-button'
import { EditMenu, FileMenu, ViewMenu } from './components/menus'
import { InteractionSwitch } from './components/interaction-switch'

export function Toolbar() {
    return (
        <div className="absolute top-5 left-5 flex flex-row items-center gap-8">
            <Menubar>
                <FileMenu />
                <EditMenu />
                <ViewMenu />
            </Menubar>
            <div className="flex flex-row items-center gap-4">
                <AddNodeButton />
                <AddEdgeToggle />
                <InteractionSwitch />
            </div>
        </div>
    )
}
