"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { NAVIGATION_ITEMS } from "./data";
import { Button } from "../ui/button";
import { twJoin } from "tailwind-merge";
import { CreateModelButton } from "./create-model";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const context = useSidebar();

  return (
    <Sidebar collapsible="icon" externalContext={context} {...props}>
      <SidebarHeader className="flex flex-col gap-6">
        <Logo />
        <CreateModelButton context={context} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAVIGATION_ITEMS} />
      </SidebarContent>
      <SidebarRail>
        <div className="h-full flex flex-col items-center justify-center ml-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-tl-none rounded-bl-none w-4 h-14"
          >
            <ChevronRight
              className={twJoin(
                context.state === "expanded" ? "rotate-180" : "",
              )}
            />
          </Button>
        </div>
      </SidebarRail>
    </Sidebar>
  );
}
