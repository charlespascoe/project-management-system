import crypto from 'crypto';

export default class CryptoUtils {
  static randomBytes(length) {
    return new Promise((fulfill, reject) => crypto.randomBytes(length, (err, buff) => err ? reject(err) : fulfill(buff)));
  }

  static hash(...data) {
    if (data.length == 0) {
      throw new Error('Need to provide 1 or more arguments');
    }

    var h = crypto.createHash('sha256');

    for (var item of data) {
      h.update(item);
    }

    return h.digest();
  }

  static hmac(key, ...data) {
    if (data.length == 0) {
      throw new Error('Need to provide 1 or more data arguments');
    }

    var mac = crypto.createHmac('sha256', key);

    for (var item of data) {
      mac.update(item);
    }

    return mac.digest();
  }
}
