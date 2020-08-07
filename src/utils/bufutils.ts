import { injectable } from "inversify";
import { Buffer } from 'buffer';

@injectable()
export class BufUtils {

  /**
   * converts the buffer to string
   * @param buf ArrayBuffer or Buffer
   * @returns string
   */
  buffer2str(buf: ArrayBuffer | Buffer): string {
    if (buf instanceof Buffer) {
      return buf.toString();
    } else {
      return Buffer.from(new Uint8Array(buf)).toString();
    }
  }

  /**
   * converts string to Buffer
   * @param str
   * @returns Buffer
   */
  str2buffer(str: string): Buffer {
    return Buffer.from(str);
  }

  /**
   * encodes the buffer to base64
   * @param buf
   * @returns base64 string format
   */
  base64encode(buf: ArrayBuffer): string {
    return Buffer.from(new Uint8Array(buf)).toString('base64');
  }

  /**
   * decodes the base64 string to buffer
   * @param base64
   * @returns buffer
   */
  base64decode(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }

}
