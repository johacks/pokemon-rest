import { CreateUserDto } from './users.dto';

describe('UserDto', () => {
  it('should be defined', () => {
    expect(new CreateUserDto()).toBeDefined();
  });
});
