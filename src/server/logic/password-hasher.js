import { argon2i as argon2 } from 'argon2-ffi';
import CryptoUtils from '../crypto-utils';

export class PasswordHasher {
  constructor(options) {
    var {
      timeCost = 32,
      memoryCost = 16384,
      parallelism = 1,
      hashLength = 32,
      saltLength = 16
    } = (options || {});

    this.argon2Options = {
      timeCost: timeCost,
      memoryCost: memoryCost,
      parallelism: parallelism,
      hashLength: hashLength
    };

    this.saltLength = saltLength;
  }

  async hash(password) {
    var salt = await this.randomSalt();
    return await argon2.hash(password, salt, this.argon2Options);
  }

  async verify(password, hash) {
    return await argon2.verify(hash, password);
  }

  async verifyUserPassword(password, user) {
    var correctPass = await this.verify(password, user.passHash);

    if (!correctPass) return false;

    // Update user's hash here if their current hash is an older algorithm/configuration

    return true;
  }

  async randomSalt() {
    return await CryptoUtils.randomBytes(this.saltLength);
  }
}

export default new PasswordHasher();
