import {
  IS_NOT_EMPTY,
  IsAlphanumeric,
  IsEmail,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const MIN_LOWER_CASE = 3;
const MIN_UPPER_CASE = 1;
const MIN_NUMBERS = 1;
const MIN_SYMBOLS = 1;
const MIN_LENGTH = 8;
export const STRONG_PASS_REGEX = new RegExp(
  `^(?=(.*[a-z]){${MIN_LOWER_CASE},})(?=(.*[A-Z]){${MIN_UPPER_CASE},})(?=(.*[0-9]){${MIN_NUMBERS},})(?=(.*[!@#$%^&*()\\-__+.]){${MIN_SYMBOLS},}).{${MIN_LENGTH},}$`,
);
export const STRONG_PASS_MESSAGE = `pass must have
- ${MIN_LOWER_CASE} lower case letter/s
- ${MIN_UPPER_CASE} upper case letter/s
- ${MIN_NUMBERS} digit/s
- ${MIN_SYMBOLS} special character/s
- minimum length of ${MIN_LENGTH} characters`;

export class RegisterInfo {
  @ApiProperty({ description: 'unique alphanumeric username' })
  @IsString()
  @MinLength(6)
  @IsAlphanumeric()
  userId: string;

  @ApiProperty({ description: STRONG_PASS_MESSAGE, pattern: 'regex' })
  @Matches(STRONG_PASS_REGEX, { message: STRONG_PASS_MESSAGE })
  pass: string;
}
