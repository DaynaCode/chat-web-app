export interface DecodedJwtPayload {
  exp: number;
  user_id: number;
  scope: string;
  owner_id?: number;
  session_state:string;
}

export class JWTModel {
  public scopes: string[];
  public userId: number;
  public expireAt: number;

  constructor(object?: DecodedJwtPayload) {
    if (object) {
      this.userId = object.user_id ?? 0;
      this.expireAt = object.exp ?? 0;
      this.scopes = object.scope ? object.scope.split(' ') : [];
    } else {
      this.userId = 0;
      this.expireAt = 0;
      this.scopes = [];
    }
  }
}