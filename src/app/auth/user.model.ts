export class User {
  constructor(
    public name: string,
    public userFBId: string,
    public FBTokenId: string,
    public FBTokenExpiresIn: Date,
  ) {}

  get token() {
    if (!this.FBTokenExpiresIn || new Date() > this.FBTokenExpiresIn) {
      return null;
    }
    return this.FBTokenId;
  }
}
