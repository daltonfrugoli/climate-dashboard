// Placeholder simples para toast
// shadcn/ui tem um sistema completo, mas isso funciona para o MVP

export function useToast() {
  const toast = ({
    title,
    description,
    variant = 'default',
  }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => {
    // Implementação simples com alert por enquanto
    // Você pode substituir por shadcn/ui toast depois
    console.log(`[${variant}] ${title}: ${description}`);
    
    // Mostrar notificação do browser se disponível
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: description });
    }
  };

  return { toast };
}