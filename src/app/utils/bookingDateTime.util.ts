/** Combines a booking date with a slot end time (HH:mm) for completion checks. */
export const combineDateAndTime = (date: Date, time: string): Date => {
  const result = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export const getBookingEndDateTime = (
  date: Date,
  turfSlot?: { slot: { endTime: string } } | null,
  customSlot?: { endTime: string } | null,
): Date | null => {
  const endTime = turfSlot?.slot.endTime ?? customSlot?.endTime;
  if (!endTime) {
    return null;
  }
  return combineDateAndTime(date, endTime);
};
