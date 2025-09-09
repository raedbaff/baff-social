export class FullUserInfo {
  id: number;
  email: string;
  username: string;
  links: string[];
  photo: string;
  bio: string;
  constructor(partial: Partial<FullUserInfo>) {
    Object.assign(this, partial);
  }
}
