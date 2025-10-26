import { z } from 'zod';

// Funções auxiliares para validação
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[\s.-]*/g, '');
  
  if (
    !cpf || 
    cpf.length !== 11 || 
    cpf === '00000000000' || 
    cpf === '11111111111' || 
    cpf === '22222222222' || 
    cpf === '33333333333' || 
    cpf === '44444444444' || 
    cpf === '55555555555' || 
    cpf === '66666666666' || 
    cpf === '77777777777' || 
    cpf === '88888888888' || 
    cpf === '99999999999'
  ) {
    return false;
  }

  let sum = 0;
  let remainder: number;
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if ((remainder === 10) || (remainder === 11)) {
    remainder = 0;
  }
  
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }
  
  sum = 0;
  
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if ((remainder === 10) || (remainder === 11)) {
    remainder = 0;
  }
  
  return remainder === parseInt(cpf.substring(10, 11));
};

const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[\s./-]/g, '');
  
  if (
    !cnpj || 
    cnpj.length !== 14 ||
    cnpj === '00000000000000' || 
    cnpj === '11111111111111' || 
    cnpj === '22222222222222' || 
    cnpj === '33333333333333' || 
    cnpj === '44444444444444' || 
    cnpj === '55555555555555' || 
    cnpj === '66666666666666' || 
    cnpj === '77777777777777' || 
    cnpj === '88888888888888' || 
    cnpj === '99999999999999'
  ) {
    return false;
  }
  
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }
  
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
};

// Lista de DDDs válidos no Brasil
const validDDDs = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99'
];

interface PhoneValidationResult {
  isValid: boolean;
  message?: string;
}

const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  
  // Verifica se tem o número mínimo e máximo de dígitos
  if (numbers.length < 10 || numbers.length > 11) {
    return false;
  }
  
  // Extrai o DDD
  const ddd = numbers.substring(0, 2);
  
  // Verifica se o DDD é válido
  if (!validDDDs.includes(ddd)) {
    return false;
  }
  
  // Verifica se é um celular (9º dígito)
  const isCellphone = numbers.length === 11;
  
  if (isCellphone) {
    // Verifica se começa com 9 (formato de celular)
    if (numbers.charAt(2) !== '9') {
      return false;
    }
    
    // Verifica se o número é válido (não pode ser sequência)
    const phoneNumber = numbers.substring(2);
    if (/(\d)\1{8,}/.test(phoneNumber)) {
      return false;
    }
  } else {
    // Validação para telefone fixo
    const phoneNumber = numbers.substring(2);
    if (/(\d)\1{7,}/.test(phoneNumber)) {
      return false;
    }
  }
  
  return true;
};

const validateCEP = (cep: string): boolean => {
  return /^\d{5}-?\d{3}$/.test(cep);
};

// Esquema de validação com mensagens personalizadas
export const userProfileSchema = z.object({
  full_name: z
    .string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'O nome deve conter apenas letras e espaços'),
    
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .refine(validatePhone, {
      message: 'Formato de telefone inválido. Use (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX',
    }),
    
  address: z
    .string()
    .min(5, 'O endereço deve ter no mínimo 5 caracteres')
    .max(200, 'O endereço não pode ter mais de 200 caracteres'),
    
  city: z
    .string()
    .min(2, 'A cidade deve ter no mínimo 2 caracteres')
    .max(100, 'A cidade não pode ter mais de 100 caracteres'),
    
  state: z
    .string()
    .length(2, 'A UF deve ter exatamente 2 caracteres')
    .toUpperCase(),
    
  cep: z
    .string()
    .refine(validateCEP, {
      message: 'CEP inválido. Formato esperado: 00000-000 ou 00000000',
    }),
    
  document: z.string()
    .min(11, 'Documento deve ter no mínimo 11 dígitos')
    .max(18, 'Documento muito longo'),
    
  document_type: z.enum(['cpf', 'cnpj'], {
    errorMap: () => ({ message: 'Selecione um tipo de documento válido' }),
  }),
  
  cnh_number: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Opcional
        return /^\d{11}$/.test(val);
      },
      { message: 'CNH deve conter 11 dígitos numéricos' },
    ),
    
  cnh_image_url: z.string().url('URL da CNH inválida').optional().or(z.literal('')),
  
  vehicle_type: z
    .string()
    .max(50, 'O tipo de veículo não pode ter mais de 50 caracteres')
    .optional()
    .or(z.literal('')),
    
  vehicle_plate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Opcional
        return /^[A-Z]{3}-?\d[A-Z]\d{2}$/i.test(val);
      },
      { message: 'Placa inválida. Use o formato: AAA-0000 ou AAA0A00' },
    ),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Funções de validação para uso em outros componentes
export const validationUtils = {
validateCPF,
validateCNPJ,
validatePhone,
validateCEP
};

export { validatePhone };
