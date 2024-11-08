import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "./ui/breadcrumb";
import { JSX } from "solid-js";
import { format } from "date-fns";
import JournalCalendar from "./journal-calendar";

// props: Component<HeaderProps>
// type HeaderProps = {};

export default function Header(): JSX.Element {
  const matchJournal = useMatch(() => "/journal");

  const date = createSignal<string[]>([]);

  const formatDate = () => {
    const dateValue = date[0]();
    if (dateValue && dateValue.length > 0 && dateValue[0]) {
      try {
        const parsedDate = new Date(dateValue[0]);
        // Check if date is valid
        if (!isNaN(parsedDate.getTime())) {
          return format(parsedDate, "MMM do, yy");
        }
      } catch (error) {
        console.error("Date parsing error:", error);
      }
    }
    return "Select a date"; // Fallback text
  };

  Boolean(matchJournal()?.path);

  return (
    <header class="sticky top-0 z-10 flex shrink-0 justify-between gap-2  bg-background p-2.5">
      <div class="flex items-center gap-2">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {/* <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink href="/" as={A}>
                <A href="/">Home</A>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator /> */}

            <BreadcrumbItem class="hidden md:block">
              {Boolean(matchJournal()?.path) ? (
                <span class=" font-medium text-muted-foreground">
                  {formatDate()}
                </span>
              ) : null}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {Boolean(matchJournal()?.path) ? (
        <div>
          <JournalCalendar date={date} />
        </div>
      ) : null}
    </header>
  );
}
