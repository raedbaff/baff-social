export class UserModel {
  id: number;
  email: string;
  username: string;
  constructor(partial: Partial<UserModel>) {
    Object.assign(this, partial);
  }
}
