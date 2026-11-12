import type { Status } from './types.ts';

type StatusInfo = {
  label: string;
  // Cor principal (bolinha) e cores da etiqueta
  dot: string;
  pillBg: string;
  pillText: string;
};

// Ordem em que os status aparecem na tela
export const STATUS_ORDER: Status[] = [
  'not_tried',
  'tried',
  'scheduled',
  'done',
  'opted_out',
];

export const STATUS_INFO: Record<Status, StatusInfo> = {
  not_tried: {
    label: 'Não tentou ainda',
    dot: '#8A929C',
    pillBg: '#EEF0F3',
    pillText: '#3A4049',
  },
  tried: {
    label: 'Tentou, sem sucesso',
    dot: '#7C4DD6',
    pillBg: '#EFE8FC',
    pillText: '#4F2A93',
  },
  scheduled: {
    label: 'Agendada',
    dot: '#E0A21B',
    pillBg: '#FFF1D6',
    pillText: '#7A4A06',
  },
  done: {
    label: 'Realizada',
    dot: '#1F9D62',
    pillBg: '#DFF3E8',
    pillText: '#0B5A3B',
  },
  opted_out: {
    label: 'Não quer mais contato',
    dot: '#D93A3A',
    pillBg: '#FDE4E2',
    pillText: '#9B1C1C',
  },
};
