import * as React from "react"
import { Briefcase, PlusCircle, LayoutDashboard, Settings } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 px-2 py-4 font-semibold text-lg group/brand cursor-default">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground group-hover/brand:scale-110 transition-transform duration-200">
                                <Briefcase className="h-4 w-4" />
                            </div>
                            <span className="">Hirely</span>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="group/item">
                                    <a href="/dashboard">
                                        <LayoutDashboard className="transition-transform group-hover/item:scale-110 duration-200" />
                                        <span>Active Jobs</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="group/item">
                                    <a href="/dashboard/settings">
                                        <Settings className="transition-transform group-hover/item:rotate-90 duration-300" />
                                        <span>Settings</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4">
                    <UserButton showName />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
