import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a currency amount with the correct symbol
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a duration string (PT2H30M) into a human-readable format (2h 30m)
 */
export function formatDuration(durationString: string): string {
  // Handle ISO 8601 duration format (PT2H30M)
  if (durationString.startsWith('PT')) {
    const hourMatch = durationString.match(/(\d+)H/);
    const minuteMatch = durationString.match(/(\d+)M/);
    
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
  }
  
  // Handle numeric duration in minutes
  if (!isNaN(Number(durationString))) {
    const totalMinutes = parseInt(durationString, 10);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }
  
  // Return the original string if format not recognized
  return durationString;
}
