import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { A } from "@solidjs/router";
import {
  DatePicker,
  DatePickerContent,
  DatePickerContext,
  DatePickerInput,
  DatePickerRangeText,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
} from "@/components/ui/date-picker";
import { ValueChangeDetails } from "node_modules/@ark-ui/solid/dist/types/components/date-picker/date-picker";
import { Accessor, JSX, Setter } from "solid-js";
import { format } from "date-fns";

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
          <DatePickerDemo date={date} />
        </div>
      ) : null}
    </header>
  );
}

type DatePickerDemoProps = {
  date: [Accessor<string[]>, Setter<string[]>];
};

const DatePickerDemo = (props: DatePickerDemoProps) => {
  const [date, setDate] = props.date;

  const handleValueChange = (details: ValueChangeDetails<string[]>) => {
    if (details.valueAsString && details.valueAsString.length > 0) {
      setDate(details.valueAsString);
    } else {
      setDate([]);
    }
  };

  return (
    <DatePicker
      value={date()}
      onValueChange={handleValueChange}
      selectionMode="single"
      parseValue={(value) => {
        return Array.isArray(value) ? value : [];
      }}
    >
      <DatePickerInput variant="icon" />
      <Portal>
        <DatePickerContent>
          <DatePickerView view="day">
            <DatePickerContext>
              {(api) => (
                <>
                  <DatePickerViewControl>
                    <DatePickerViewTrigger>
                      <DatePickerRangeText />
                    </DatePickerViewTrigger>
                  </DatePickerViewControl>
                  <DatePickerTable>
                    <DatePickerTableHead>
                      <DatePickerTableRow>
                        <Index each={api().weekDays}>
                          {(weekDay) => (
                            <DatePickerTableHeader>
                              {weekDay().short}
                            </DatePickerTableHeader>
                          )}
                        </Index>
                      </DatePickerTableRow>
                    </DatePickerTableHead>
                    <DatePickerTableBody>
                      <Index each={api().weeks}>
                        {(week) => (
                          <DatePickerTableRow>
                            <Index each={week()}>
                              {(day) => (
                                <DatePickerTableCell value={day()}>
                                  <DatePickerTableCellTrigger>
                                    {day().day}
                                  </DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </Index>
                          </DatePickerTableRow>
                        )}
                      </Index>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </>
              )}
            </DatePickerContext>
          </DatePickerView>
          <DatePickerView
            view="month"
            class="w-[calc(var(--reference-width)-(0.75rem*2))]"
          >
            <DatePickerContext>
              {(api) => (
                <>
                  <DatePickerViewControl>
                    <DatePickerViewTrigger>
                      <DatePickerRangeText />
                    </DatePickerViewTrigger>
                  </DatePickerViewControl>
                  <DatePickerTable>
                    <DatePickerTableBody>
                      <Index
                        each={api().getMonthsGrid({
                          columns: 4,
                          format: "short",
                        })}
                      >
                        {(months) => (
                          <DatePickerTableRow>
                            <Index each={months()}>
                              {(month) => (
                                <DatePickerTableCell value={month().value}>
                                  <DatePickerTableCellTrigger>
                                    {month().label}
                                  </DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </Index>
                          </DatePickerTableRow>
                        )}
                      </Index>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </>
              )}
            </DatePickerContext>
          </DatePickerView>
          <DatePickerView
            view="year"
            class="w-[calc(var(--reference-width)-(0.75rem*2))]"
          >
            <DatePickerContext>
              {(api) => (
                <>
                  <DatePickerViewControl>
                    <DatePickerViewTrigger>
                      <DatePickerRangeText />
                    </DatePickerViewTrigger>
                  </DatePickerViewControl>
                  <DatePickerTable>
                    <DatePickerTableBody>
                      <Index
                        each={api().getYearsGrid({
                          columns: 4,
                        })}
                      >
                        {(years) => (
                          <DatePickerTableRow>
                            <Index each={years()}>
                              {(year) => (
                                <DatePickerTableCell value={year().value}>
                                  <DatePickerTableCellTrigger>
                                    {year().label}
                                  </DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              )}
                            </Index>
                          </DatePickerTableRow>
                        )}
                      </Index>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </>
              )}
            </DatePickerContext>
          </DatePickerView>
        </DatePickerContent>
      </Portal>
    </DatePicker>
  );
};
