import { JSX, type Component } from "solid-js";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "./ui/breadcrumb";
import { A } from "@solidjs/router";

// props: Component<HeaderProps>
// type HeaderProps = {};

export default function Header(): JSX.Element {
  return (
    <header class="sticky top-0 z-10 flex shrink-0 justify-between gap-2  bg-background p-2.5">
      <div class="flex items-center gap-2">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink href="/" as={A}>
                <A href="/">Home</A>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* TODO: add calendar here in the jounal section */}
    </header>
  );
}
