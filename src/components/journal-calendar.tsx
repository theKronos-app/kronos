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
import { isToday } from "date-fns";

type JournalCalendarProps = {
  value: string[];
  onValueChange: (details: ValueChangeDetails<string[]>) => void;
};

const JournalCalendar = (props: JournalCalendarProps) => {
  return (
    <DatePicker
      value={props.value}
      onValueChange={props.onValueChange}
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
                                  <DatePickerTableCellTrigger
                                    class={
                                      isToday(new Date(day().toString()))
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : ""
                                    }
                                  >
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

export default JournalCalendar;
