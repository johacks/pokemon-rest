import { IS_NOT_EMPTY, IsAlphanumeric, IsEmail, IsString, Matches, MinLength } from 'class-validator';

const MIN_LOWER_CASE = 3;
const MIN_UPPER_CASE = 1;
const MIN_NUMBERS = 1;
const MIN_SYMBOLS = 1;
const MIN_LENGTH = 8;
export const STRONG_PASS_REGEX = new RegExp(
  `^(?=(.*[a-z]){${MIN_LOWER_CASE},})(?=(.*[A-Z]){${MIN_UPPER_CASE},})(?=(.*[0-9]){${MIN_NUMBERS},})(?=(.*[!@#$%^&*()\\-__+.]){${MIN_SYMBOLS},}).{${MIN_LENGTH},}$`,
);
export const STRONG_PASS_MESSAGE = `pass must have
- ${MIN_LOWER_CASE} lower case letters
- ${MIN_UPPER_CASE} upper case letters
- ${MIN_NUMBERS} digits
- ${MIN_SYMBOLS} special characters
- ${MIN_LENGTH} minimum length`;

export class RegisterInfo {
  @IsString()
  @MinLength(6)
  @IsAlphanumeric()
  userId: string;

  @Matches(STRONG_PASS_REGEX, { message: STRONG_PASS_MESSAGE })
  pass: string;
}
