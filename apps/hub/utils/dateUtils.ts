export async function addSeconds(
  date: Date | null,
  seconds: number
): Promise<Date> {
  if (!date) {
    return new Date();
  }
  return new Date(date.getTime() + seconds * 1000);
}
