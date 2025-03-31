
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const SidebarContext = React.createContext<{
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultExpanded?: boolean
}

function SidebarProvider({
  children,
  defaultExpanded = true,
}: SidebarProviderProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

function Sidebar({ children, className }: SidebarProps) {
  const { expanded } = useSidebar()

  return (
    <aside
      className={cn(
        "h-screen border-r transition-all duration-300 ease-in-out",
        expanded ? "w-64" : "w-16",
        className
      )}
    >
      {children}
    </aside>
  )
}

interface SidebarHeaderProps {
  children?: React.ReactNode
  className?: string
}

function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={cn("p-4 border-b", className)}>
      {children}
    </div>
  )
}

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("px-3 py-2", className)}>
      {children}
    </div>
  )
}

interface SidebarFooterProps {
  children?: React.ReactNode
  className?: string
}

function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("mt-auto p-4 border-t", className)}>
      {children}
    </div>
  )
}

interface SidebarGroupProps {
  children?: React.ReactNode
  className?: string
}

function SidebarGroup({ children, className }: SidebarGroupProps) {
  return (
    <div className={cn("pb-4", className)}>
      {children}
    </div>
  )
}

interface SidebarGroupLabelProps {
  children: React.ReactNode
  className?: string
}

function SidebarGroupLabel({ children, className }: SidebarGroupLabelProps) {
  const { expanded } = useSidebar()

  if (!expanded) {
    return null
  }

  return (
    <div className={cn("mb-2 px-2 text-xs font-semibold text-muted-foreground", className)}>
      {children}
    </div>
  )
}

interface SidebarGroupContentProps {
  children: React.ReactNode
  className?: string
}

function SidebarGroupContent({ children, className }: SidebarGroupContentProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  )
}

interface SidebarMenuProps {
  children: React.ReactNode
  className?: string
}

function SidebarMenu({ children, className }: SidebarMenuProps) {
  return (
    <nav className={cn("grid gap-1", className)}>
      {children}
    </nav>
  )
}

interface SidebarMenuItemProps {
  children: React.ReactNode
  className?: string
}

function SidebarMenuItem({ children, className }: SidebarMenuItemProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
  variant?: "default" | "ghost"
  className?: string
}

function SidebarMenuButton({
  children,
  asChild = false,
  variant = "ghost",
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { expanded } = useSidebar()
  const Comp = asChild ? React.Fragment : "button"
  const compProps = asChild ? {} : props

  return (
    <Comp
      className={cn(
        "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        {
          "justify-center": !expanded,
        },
        className
      )}
      {...compProps}
    >
      {children}
    </Comp>
  )
}

interface SidebarTriggerProps {
  className?: string
}

function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { expanded, setExpanded } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("px-2", className)}
      onClick={() => setExpanded(!expanded)}
    >
      {expanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
}
