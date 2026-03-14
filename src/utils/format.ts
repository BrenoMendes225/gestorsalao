
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '---';
  
  // Handle ISO strings or YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  // Use Intl.DateTimeFormat for reliable pt-BR formatting
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC' // Important for YYYY-MM-DD strings to avoid shift
  }).format(date);
};

export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '--:--';
  
  // If it's already HH:mm, just return it (assuming no seconds)
  // If it has seconds (HH:mm:ss), take first 5 chars
  return timeString.slice(0, 5);
};

export const formatDateTime = (dateString: string, timeString: string): string => {
  return `${formatDate(dateString)} às ${formatTime(timeString)}`;
};
