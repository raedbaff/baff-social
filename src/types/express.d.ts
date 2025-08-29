import { JWTUser } from "src/services/auth/jwt.strategy";

declare global {
    namespace Express {
        interface User extends JWTUser{}
    }
}