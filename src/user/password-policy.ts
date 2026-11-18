export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIRES_LETTER_AND_NUMBER = /^(?=.*\p{L})(?=.*\d).+$/u;

export function cumplePoliticaPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    PASSWORD_REQUIRES_LETTER_AND_NUMBER.test(password)
  );
}
