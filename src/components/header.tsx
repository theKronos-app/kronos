import { Accessor, JSX, Setter, type Component } from "solid-js";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
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

// props: Component<HeaderProps>
// type HeaderProps = {};

export default function Header(): JSX.Element {
  const matchJournal = useMatch(() => "/journal");
  const [date, setDate] = createSignal<string[]>([]);

  createEffect(() => {
    console.log(date());
  });

  Boolean(matchJournal()?.path);

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
      {Boolean(matchJournal()?.path) ? (
        <div>
          <DatePickerDemo />
        </div>
      ) : (
        <div>nothing</div>
      )}
    </header>
  );
}

const DatePickerDemo = () => {
  return (
    <DatePicker>
      <DatePickerInput placeholder="Pick a date" />
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
