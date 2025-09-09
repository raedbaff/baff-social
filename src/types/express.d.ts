import { JWTUser } from 'src/auth/jwt.strategy';

declare global {
  namespace Express {
    interface User extends JWTUser {}
  }
}
