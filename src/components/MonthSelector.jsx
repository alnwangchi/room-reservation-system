import { Listbox } from '@headlessui/react';
import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import { MONTH_NAMES } from '../constants';

function MonthSelector({
  selectedMonth,
  onMonthChange,
  className = 'w-48',
  placeholder = '選擇月份',
  showYear = true,
}) {
  // 月份選項
  const monthOptions = Array.from({ length: 4 }, (_, index) => {
    const date = dayjs().add(index, 'month');
    return {
      value: date.format('YYYY-MM'),
      label: showYear
        ? `${date.year()} 年 ${MONTH_NAMES[date.month()]}`
        : MONTH_NAMES[date.month()],
    };
  });

  return (
    <div className={className}>
      <Listbox value={selectedMonth} onChange={onMonthChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm border border-gray-300">
            <span className="block truncate">
              {monthOptions.find(m => m.value === selectedMonth)?.label ||
                placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
            {monthOptions.map(month => (
              <Listbox.Option
                key={month.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                  }`
                }
                value={month.value}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {month.label}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-indigo-600' : 'text-indigo-600'
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}

export default MonthSelector;
