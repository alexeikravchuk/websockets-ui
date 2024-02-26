import { FIELD_STATE } from '../types';

export const getEmptyField = (): FIELD_STATE[][] => {
  const field = new Array(10).fill(null);
  field.forEach((_, i) => {
    field[i] = new Array(10).fill(FIELD_STATE.EMPTY);
  });
  return field;
};