"use client"

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'

import { Field } from '@/components/ui/field'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group'

import { cn } from '@/lib/utils'
import { ko } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y}년 ${m}월 ${d}일`
}

function isValidLocalDate(
  date: Date,
  y: number,
  monthIndex: number,
  d: number
) {
  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === y &&
    date.getMonth() === monthIndex &&
    date.getDate() === d
  )
}

function parseKoreanDateInput(value: string): Date | undefined {
  const s = value.trim()
  if (!s) {
    return undefined
  }

  const korean = /^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일\s*$/.exec(s)
  if (korean) {
    const y = Number(korean[1])
    const mo = Number(korean[2]) - 1
    const d = Number(korean[3])
    const date = new Date(y, mo, d)
    if (isValidLocalDate(date, y, mo, d)) {
      return date
    }
    return undefined
  }

  const separated = /^\s*(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*\.?\s*$/.exec(
    s
  )
  if (separated) {
    const y = Number(separated[1])
    const mo = Number(separated[2]) - 1
    const d = Number(separated[3])
    const date = new Date(y, mo, d)
    if (isValidLocalDate(date, y, mo, d)) {
      return date
    }
    return undefined
  }

  return undefined
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

function toLocalCalendarDate(date: Date | undefined): Date | undefined {
  if (!date || isNaN(date.getTime())) {
    return undefined
  }

  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0

  if (isUtcMidnight) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
      0,
      0,
      0
    )
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0
  )
}

interface DatePickerInputProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  className?: string
}

export function DatePickerInput({ value, onChange, className }: DatePickerInputProps) {
  const normalizedValue = toLocalCalendarDate(value)

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(normalizedValue)
  const [month, setMonth] = useState<Date>(() => normalizedValue ?? new Date())
  const [inputValue, setInputValue] = useState<string>(formatDate(normalizedValue))

  const toSafeOnChangeDate = useCallback((d: Date) => {
    const next = new Date(d)
    next.setHours(12, 0, 0, 0)
    return next
  }, [])

  useEffect(() => {
    const next = toLocalCalendarDate(value)
    setDate(next)
    setMonth(next ?? new Date())
    setInputValue(formatDate(next))
  }, [value])

  return (
    <Field className={cn("w-1/3", className ?? "")}>
      <InputGroup className="bg-zinc-100 text-zinc-500 rounded-lg">
        <InputGroupInput
          id="date-required"
          className="text-sm"
          value={inputValue}
          placeholder=""
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value
            setInputValue(raw)
            if (!raw.trim()) {
              setDate(undefined)
              setMonth(new Date())
              onChange?.(undefined)
              return
            }

            const parsed = parseKoreanDateInput(raw)
            if (parsed && isValidDate(parsed)) {
              setDate(parsed)
              setMonth(parsed)
              onChange?.(toSafeOnChangeDate(parsed))
            }
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id="date-picker"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="날짜 선택"
                />
              }
            >
              <CalendarIcon />
              <span className="sr-only">날짜 선택</span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0 shadow-xs"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                locale={ko}
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(next) => {
                  if (!next) {
                    setDate(undefined)
                    setInputValue("")
                    setOpen(false)
                    onChange?.(undefined)
                    return
                  }

                  setDate(next)
                  setMonth(next)
                  setInputValue(formatDate(next))
                  setOpen(false)
                  onChange?.(toSafeOnChangeDate(next))
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
