import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data/hora para timezone de São Paulo (UTC-3)
 */
export function formatDateTime(date: string | Date, pattern: string = 'dd/MM/yyyy HH:mm'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, pattern, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '--';
  }
}

/**
 * Formata apenas a hora
 */
export function formatTime(date: string | Date): string {
  return formatDateTime(date, 'HH:mm');
}

/**
 * Formata apenas a data
 */
export function formatDate(date: string | Date): string {
  return formatDateTime(date, 'dd/MM/yyyy');
}

/**
 * Formata data com hora completa
 */
export function formatDateTimeFull(date: string | Date): string {
  return formatDateTime(date, "dd/MM/yyyy 'às' HH:mm");
}

/**
 * Formata para gráfico (hora e data curta)
 */
export function formatChartTime(date: string | Date): string {
  return formatDateTime(date, 'HH:mm');
}

export function formatChartDate(date: string | Date): string {
  return formatDateTime(date, 'dd/MM');
}