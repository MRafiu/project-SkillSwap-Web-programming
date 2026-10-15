import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Ban,
  AlertCircle
} from "lucide-react";

export default function CalendarAvailabilityPicker({
  calendarDays = {},
  currentYear,
  currentMonth,
  onMonthChange,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  loading = false,
}) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    let nextY = currentYear;
    let nextM = currentMonth - 1;
    if (nextM < 1) {
      nextM = 12;
      nextY -= 1;
    }
    onMonthChange(nextY, nextM);
  };

  const handleNextMonth = () => {
    let nextY = currentYear;
    let nextM = currentMonth + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    onMonthChange(nextY, nextM);
  };

  // Calendar matrix calculations
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Today for past-date disabling (timezone safe)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const activeDayData = selectedDate ? calendarDays[selectedDate] : null;

  return (
    <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-5 md:p-6 text-white shadow-xl space-y-6">
      {/* 1. Header with Month Navigator */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2D458B]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-white">
              {monthNames[currentMonth - 1]} {currentYear}
            </h3>
            <p className="text-[11px] text-[#8EA1D0]">Pick a date to browse available session slots</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[#1A2E68] hover:bg-[#253D84] text-[#9DAACB] hover:text-white border border-[#2D458B] transition"
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[#1A2E68] hover:bg-[#253D84] text-[#9DAACB] hover:text-white border border-[#2D458B] transition"
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Calendar Grid */}
      <div>
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-[#8EA1D0] mb-2 uppercase tracking-wider">
          {dayHeaders.map((header) => (
            <div key={header} className="py-1">
              {header}
            </div>
          ))}
        </div>

        {/* Days cells */}
        {loading ? (
          <div className="py-12 text-center text-xs text-[#8EA1D0] bg-[#1A2E68]/30 rounded-xl">
            Loading calendar slots...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset cells before the 1st */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-11 rounded-xl bg-transparent" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isPast = dateKey < todayStr;
              const dayData = calendarDays[dateKey];
              const isSelected = selectedDate === dateKey;

              const hasSlots = dayData && dayData.slots && dayData.slots.length > 0;
              const hasOpenSlots = dayData && dayData.has_availability;
              const isBlackout = dayData && dayData.is_blackout;
              const allBooked = hasSlots && !hasOpenSlots && !isBlackout;

              let cellStyle = "bg-[#0B1A42]/50 border-transparent text-[#6B789E]";
              if (isPast) {
                cellStyle = "bg-[#071333]/40 border-transparent text-gray-600 opacity-40 cursor-not-allowed";
              } else if (isSelected) {
                cellStyle = "bg-[#2864E8] border-[#2864E8] text-white shadow-lg ring-2 ring-blue-400/40";
              } else if (isBlackout) {
                cellStyle = "bg-amber-950/20 border-amber-800/30 text-amber-300/70 hover:border-amber-600";
              } else if (hasOpenSlots) {
                cellStyle = "bg-[#1A2E68] border-[#2D458B] text-white hover:border-blue-400 hover:bg-[#203679] cursor-pointer";
              } else if (allBooked) {
                cellStyle = "bg-rose-950/20 border-rose-900/30 text-rose-300 hover:border-rose-700 cursor-pointer";
              } else {
                cellStyle = "bg-[#0B1A42]/60 border-[#1C2C5E]/30 text-[#8EA1D0] hover:bg-[#132352] cursor-pointer";
              }

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    if (!isPast) {
                      onSelectDate(dateKey);
                    }
                  }}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center relative text-xs font-bold transition border ${cellStyle}`}
                >
                  <span>{dayNum}</span>

                  {/* Dot Indicators */}
                  {!isPast && (
                    <div className="flex gap-0.5 mt-0.5">
                      {hasOpenSlots && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-400"}`} />
                      )}
                      {allBooked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      )}
                      {isBlackout && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-[#2D458B]/50 flex flex-wrap items-center gap-4 text-[11px] text-[#8EA1D0]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2864E8]"></span>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Blackout / Leave</span>
          </div>
        </div>
      </div>

      {/* 3. Time Slots for Selected Date */}
      <div className="pt-4 border-t border-[#2D458B]/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Clock size={16} className="text-emerald-400" />
            <span>Time Slots for {selectedDate ? selectedDate : "Selected Date"}</span>
          </div>
          {activeDayData?.day_of_week && (
            <span className="text-xs bg-blue-500/20 text-blue-300 font-semibold px-2.5 py-0.5 rounded-lg border border-blue-500/30">
              {activeDayData.day_of_week}
            </span>
          )}
        </div>

        {!selectedDate ? (
          <div className="bg-[#1A2E68]/60 border border-[#2D458B] rounded-xl p-4 text-xs text-[#8EA1D0] text-center">
            Click any active date on the calendar above to view available hours.
          </div>
        ) : activeDayData?.is_blackout ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 flex items-center gap-3">
            <Ban size={18} className="text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block">Teacher is unavailable on this date</span>
              <span className="text-[11px] text-amber-300/80">
                Reason: {activeDayData.blackout_reason || "Scheduled time off / Blackout"}
              </span>
            </div>
          </div>
        ) : !activeDayData || !activeDayData.slots || activeDayData.slots.length === 0 ? (
          <div className="bg-[#1A2E68]/60 border border-[#2D458B] rounded-xl p-4 text-xs text-[#8EA1D0] text-center">
            No specific teaching slots scheduled on {activeDayData?.day_of_week || "this day"}. You can coordinate timing directly with the teacher via chat!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {activeDayData.slots.map((slot) => {
              const isSelected = selectedTime === slot.time_slot;
              return (
                <button
                  key={slot.slot_id}
                  type="button"
                  disabled={slot.is_booked}
                  onClick={() => onSelectTime(slot.time_slot)}
                  className={`p-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition ${
                    slot.is_booked
                      ? "bg-rose-950/20 border-rose-900/40 text-rose-400/60 cursor-not-allowed"
                      : isSelected
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-300"
                      : "bg-[#1A2E68] border-[#2D458B] text-[#D9DEFA] hover:border-emerald-400 hover:bg-[#203679]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className={isSelected ? "text-white" : "text-blue-400"} />
                    <span className="truncate">{slot.time_slot}</span>
                  </div>

                  {slot.is_booked ? (
                    <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-900/40 px-1.5 py-0.5 rounded">
                      Booked
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 size={15} className="text-white shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
