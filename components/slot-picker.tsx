"use client";

import { useState, useEffect } from "react";
import { format, addMinutes, setHours, setMinutes, isBefore, startOfDay, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCalendarEvents } from "@/app/actions/availability";
import { Loader2, X, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SlotPickerProps {
    onSlotsChange: (slots: Date[]) => void;
}

export function SlotPicker({ onSlotsChange }: SlotPickerProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
    const [busySlots, setBusySlots] = useState<{ start: Date; end: Date }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Generate slots for the selected day (9 AM - 6 PM)
    const availableTimeSlots = date ? generateTimeSlots(date) : [];

    useEffect(() => {
        if (date) {
            fetchAvailability(date);
        }
    }, [date]);

    // Update parent when selection changes
    useEffect(() => {
        onSlotsChange(selectedSlots);
    }, [selectedSlots, onSlotsChange]);

    async function fetchAvailability(selectedDate: Date) {
        setIsLoading(true);
        const start = startOfDay(selectedDate).toISOString();
        const end = new Date(selectedDate.getTime() + 86400000).toISOString(); // End of day

        const result = await getCalendarEvents(start, end);
        if (result.success && result.events) {
            // Parse events into Date objects
            const busy = result.events.map((e: any) => ({
                start: new Date(e.start.dateTime || e.start.date),
                end: new Date(e.end.dateTime || e.end.date),
            }));
            setBusySlots(busy);
        }
        setIsLoading(false);
    }

    function generateTimeSlots(baseDate: Date) {
        const slots = [];
        let currentTime = setMinutes(setHours(baseDate, 9), 0); // Start 9:00 AM
        const endTime = setMinutes(setHours(baseDate, 18), 0); // End 6:00 PM

        while (isBefore(currentTime, endTime)) {
            slots.push(new Date(currentTime));
            currentTime = addMinutes(currentTime, 30); // 30 min intervals
        }
        return slots;
    }

    function isSlotBusy(slot: Date) {
        const slotEnd = addMinutes(slot, 30); // Assume 30 min slots for checking
        return busySlots.some(busy => {
            // Check overlap
            return (slot < busy.end && slotEnd > busy.start);
        });
    }

    function toggleSlot(slot: Date) {
        const isSelected = selectedSlots.some(s => s.getTime() === slot.getTime());
        if (isSelected) {
            setSelectedSlots(prev => prev.filter(s => s.getTime() !== slot.getTime()));
        } else {
            if (selectedSlots.length >= 3) return; // Max 3
            setSelectedSlots(prev => [...prev, slot]);
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full h-[520px]">
            {/* Left Column: Calendar & Selected Slots */}
            <div className="flex flex-col h-full w-[320px] shrink-0 border border-border/50 rounded-xl bg-card shadow-2xl overflow-hidden">
                <div className="p-3 border-b border-border/50 bg-muted/20">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors uppercase font-bold rounded-md",
                            day_today: "bg-muted text-foreground font-bold rounded-md",
                        }}
                    />
                </div>

                <div className="flex-1 p-4 bg-muted/10 overflow-y-auto">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">Selected Slots ({selectedSlots.length}/3)</p>
                    <div className="space-y-2">
                        {selectedSlots.length === 0 && (
                            <div className="text-sm text-muted-foreground italic text-center py-8 border-2 border-dashed border-border/30 rounded-xl bg-muted/5">
                                No slots selected
                            </div>
                        )}
                        {selectedSlots.map((slot, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30 group hover:border-primary/50 transition-all">
                                <span className="text-sm font-medium text-foreground">{format(slot, "MMM d, h:mm a")}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                    onClick={() => toggleSlot(slot)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Available Times */}
            <div className="flex-1 flex flex-col h-full border border-border/50 rounded-xl bg-card shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between sticky top-0 z-10 font-bold uppercase tracking-tight">
                    <h4 className="flex items-center gap-2 text-foreground">
                        Available Times
                        <Badge variant="secondary" className="font-bold bg-muted/50 border-border/50">
                            {date ? format(date, "MMMM d") : "Select a date"}
                        </Badge>
                    </h4>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>

                <ScrollArea className="flex-1 p-4">
                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="h-11 bg-muted/20 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
                            {availableTimeSlots.map((slot, idx) => {
                                const busy = isSlotBusy(slot);
                                const selected = selectedSlots.some(s => s.getTime() === slot.getTime());
                                return (
                                    <Button
                                        key={idx}
                                        variant={selected ? "default" : "outline"}
                                        className={cn(
                                            "w-full justify-center transition-all h-11 rounded-xl font-medium",
                                            selected && "bg-primary text-primary-foreground hover:bg-primary/90 ring-2 ring-primary/20",
                                            busy && "opacity-30 bg-muted/10 hover:bg-muted/10 cursor-not-allowed border-dashed grayscale"
                                        )}
                                        disabled={busy || (selectedSlots.length >= 3 && !selected)}
                                        onClick={() => toggleSlot(slot)}
                                    >
                                        {format(slot, "h:mm a")}
                                    </Button>
                                )
                            })}
                            {availableTimeSlots.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <CalendarIcon className="w-12 h-12 mb-4 opacity-10" />
                                    <p className="font-semibold uppercase tracking-wider text-xs">No slots available</p>
                                    <p className="text-xs opacity-60">Try selecting a different date</p>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
