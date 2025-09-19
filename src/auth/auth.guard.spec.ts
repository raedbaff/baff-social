import { JWTAuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new JWTAuthGuard()).toBeDefined();
  });
});
