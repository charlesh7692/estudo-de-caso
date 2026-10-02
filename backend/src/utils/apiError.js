export class ApiError extends Error {
  constructor(statusCode, message, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function normalizeDate(dateValue) {
  if (!dateValue || typeof dateValue !== 'string') {
    return null;
  }

  const match = dateValue.match(/^\d{4}-\d{2}-\d{2}$/);
  return match ? dateValue : null;
}

export function normalizeTime(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const match = timeValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return match ? timeValue : null;
}
