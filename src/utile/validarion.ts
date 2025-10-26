// src/utils/validation.ts
import { cpf as cpfValidator } from '@fnando/cpf';
import { cnpj as cnpjValidator } from '@fnando/cnpj';

export const validateDocument = (document: string, type: 'cpf' | 'cnpj'): boolean => {
  const cleaned = document.replace(/\D/g, '');
  return type === 'cpf' ? cpfValidator.isValid(cleaned) : cnpjValidator.isValid(cleaned);
};

export const formatDocument = (document: string, type: 'cpf' | 'cnpj'): string => {
  const cleaned = document.replace(/\D/g, '');
  if (type === 'cpf') {
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  } else {
    return cleaned
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  }
};