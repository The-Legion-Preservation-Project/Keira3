import { Flag } from '@keira/shared/constants';

export const SMART_EVENT_FLAGS: Flag[] = [
  { bit: 0, name: 'NOT_REPEATABLE (Event can not repeat)' },
  { bit: 1, name: 'DIFFICULTY_0_DEPRECATED' },
  { bit: 2, name: 'DIFFICULTY_1_DEPRECATED' },
  { bit: 3, name: 'DIFFICULTY_2_DEPRECATED' },
  { bit: 4, name: 'DIFFICULTY_3_DEPRECATED' },
  { bit: 5, name: 'ALLOW_EVENT_IN_COMBAT' },
  { bit: 6, name: 'EVENT_NON_COMBAT' },
  { bit: 7, name: 'DEBUG_ONLY (only used in debug build)' },
  { bit: 8, name: 'DONT_RESET (Event will not reset)' },
  { bit: 9, name: 'WHILE_CHARMED (AI owner is charmed)' },
];
