import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "./ui/breadcrumb";
import { JSX } from "solid-js";
import { format } from "date-fns";
import JournalCalendar from "./journal-calendar";
import { journalStore, setJournalStore } from "@/store/journal-store";
import { ValueChangeDetails } from "node_modules/@ark-ui/solid/dist/types/components/date-picker/date-picker";
import { useJournal } from "@/composables/useJournal";

// props: Component<HeaderProps>
// type HeaderProps = {};

export default function Header(): JSX.Element {
  const { loadEntry } = useJournal();
  const matchJournal = useMatch(() => "/journal");

  const handleDateChange = (details: ValueChangeDetails<string[]>) => {
    if (details.valueAsString?.[0]) {
      const newDate = details.valueAsString[0];
      setJournalStore("currentDate", newDate);
      if (matchJournal()) {
        // Only load entry if we're on journal page
        loadEntry(newDate);
      }
    }
  };
  const formatDate = () => {
    try {
      const parsedDate = new Date(journalStore.currentDate);
      if (!isNaN(parsedDate.getTime())) {
        return format(parsedDate, "MMM do, yy");
      }
    } catch (error) {
      console.error("Date parsing error:", error);
    }
    return "Select a date";
  };

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
          <JournalCalendar
            value={[journalStore.currentDate]}
            onValueChange={handleDateChange}
          />
        </div>
      ) : null}
    </header>
  );
}
