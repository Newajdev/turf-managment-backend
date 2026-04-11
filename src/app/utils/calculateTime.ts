export const calculateDurationInMinutes = (start: string, end: string) => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  let duration = endMinutes - startMinutes;
  
  if (duration <= 0) {
    duration += 24 * 60;
  }
  
  return duration;
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const isTimeOverlap = (
  range1: { startTime: string; endTime: string },
  range2: { startTime: string; endTime: string }
): boolean => {
  const s1 = timeToMinutes(range1.startTime);
  const e1 = timeToMinutes(range1.endTime);
  const s2 = timeToMinutes(range2.startTime);
  const e2 = timeToMinutes(range2.endTime);

  // Normalize for overnight slots if necessary, 
  // but usually turf slots are within a single day.
  // Standard overlap check: (StartA < EndB) && (EndA > StartB)
  return s1 < e2 && e1 > s2;
};