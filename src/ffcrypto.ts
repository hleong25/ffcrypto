
class BufUtils {

  static base64encode(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  static base64decode(base64: string): ArrayBuffer {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

}

class RsaFacade {

  private getSubtle(): SubtleCrypto {
    return window.crypto.subtle;
  }

  getAlgorithm(): RsaHashedKeyGenParams {
    return {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    };
  }

  async generateKey(): Promise<CryptoKeyPair> {
    const algo = this.getAlgorithm();
    return this.getSubtle().generateKey(algo, true, ["encrypt", "decrypt"])
  }

  async exportKey(key: CryptoKey): Promise<string> {
    return this.getSubtle().exportKey("jwk", key)
      .then(jwk => {
        return JSON.stringify(jwk, null, ' ');
      });

  }

  async importKey(type: string, jsonkey: string): Promise<CryptoKey> {
    const jwk = <JsonWebKey>JSON.parse(jsonkey);
    const algo = this.getAlgorithm();
    return this.getSubtle().importKey("jwk", jwk, algo, true, [type])
  }

  async importKeys(privateKey: string, publicKey: string): Promise<CryptoKeyPair> {

    const privKey: CryptoKey = await this.importKey("decrypt", privateKey);
    const pubKey: CryptoKey = await this.importKey("encrypt", publicKey);

    const keypair: CryptoKeyPair = new CryptoKeyPair();
    keypair.privateKey = privKey;
    keypair.publicKey = pubKey;

    return Promise.resolve(keypair);
  }

  async importJsonWebKey(type: string, jwk: JsonWebKey): Promise<CryptoKey> {
    const algo = this.getAlgorithm();
    return this.getSubtle().importKey("jwk", jwk, algo, true, [type])
  }

  async importJsonWebKeys(privateKey: JsonWebKey, publicKey: JsonWebKey): Promise<CryptoKeyPair> {

    const privKey: CryptoKey = await this.importJsonWebKey("decrypt", privateKey);
    const pubKey: CryptoKey = await this.importJsonWebKey("encrypt", publicKey);

    const keypair: CryptoKeyPair = {
      privateKey: privKey,
      publicKey: pubKey
    }

    return Promise.resolve(keypair);
  }

  async encrypt(publicKey: CryptoKey, data: ArrayBuffer): Promise<string> {
    const algo = this.getAlgorithm();
    return this.getSubtle().encrypt(algo, publicKey, data)
      .then(buf => BufUtils.base64encode(buf));
  }

  async decrypt(privateKey: CryptoKey, base64data: string): Promise<ArrayBuffer> {
    const algo = this.getAlgorithm();
    const buf = BufUtils.base64decode(base64data);
    return this.getSubtle().decrypt(algo, privateKey, buf);
  }

}


let privateKey: JsonWebKey | null = null;
let publicKey: JsonWebKey | null = null;

if (true) {
  privateKey = {
    "alg": "RSA-OAEP-256",
    "d": "rdl4SXPZN6c77njTZy0BUvxwE7pnj_L9SH86C5ehlgI7LbrEobjqSmCFOQCyn6K_y7fV0C8RKuDWQilIj2vWZoDs6ql0umz22db1YjpfQNuzuDBb9vLR5POyMCoNwKoirHCrz9dRRXnFdH2F1cYLFPPnVcqgjqd00CPbEIo952QjF9gW5ZbK40skwoXXPn2S7dnzjDpRbRK7U2oRduBC4mcmcZ_gRPnQIOy3HYqoPc-GKIR0PjPDFcpsWYKj-XlbrwuzZ-1ZVa95x7rPgPrkjZuG-yPBo1OeFXvqH4wWtYrQrZJXfAKgt0rZeFJPT_ooa_BJ7OOCyeLrCEpYWfdunx0z-954qu04YnErGbKBDJutJ84jtuH2uV27ju-I4kOOPFAcbXqPkKi7828TKA5trXggDPeEdBSXKbcHh2Bw0aMH4hIQsZ5HKjhN1F-LGmZNoW6tZxdNDwz4pZcj56rlRvS_UZ2mSKCspKFa9eRsCqxFeN6BmOeqUmd2dypWSw3s7UyKcfoDnXp3dm1tvhgLxVL488pN-kdZuHqQoormpiueDX6mFZwWM3Pq8Ug4aQYWOCpJb2ydInNUpqdvilpIfQMR72kSKNrjqzk63OnoPnjVH77H67u4FH-dlYpXNhC0PgTWOR817sg7y4tY-4gvAPnfQ2U8NbCbK4YKIu1zHQ",
    "dp": "XiG6PPLjiTdFpX4R37QIMNXie1gRAaqXL8fLf_Lld-VATok40EfHrgXOIWHPXPSvzQTZSgEAIleiEhvbUCGP0HVh_ELABr-OVl-OAJAz6nMDPhZdj1uET3hwe16WLXuoee4BZdqq72qXpJUKzswTCidPcfHd2NQAc3gC7e1QIrGQgpi4tbNRv3TrLHpeZsJ-R6QjiSi1qjKLsDUIo3LhIbjDQbn2w4EkTvDRTsFsfM_aB3AFLWYwDmoWuCk6q0vZNiWmwBCQVzoJMHq9Mbd8KTk5Ylox1U1ICXe7v2W862QVuY-5o5r4OCYF8f_0RkKLhMFjnUjBGHIQoW_kCkxAAQ",
    "dq": "atKE1rkk7i6NRLRHWd2KJwv5vOLTk3Nl4_CEcihJXP0buvPANvDiOBzme5EbkFfuJiui1Xdc0msSw7aKcv-4QGXXMIksfgNEjIlqeD26STHiQvQsyfeI3-gcb6g-IOr5Hu1vr5TpV4Jxk91g4NF_3vNtSRSNjhSf5ekRuyeAqdWtsgMOX0JEtSR8OC1CEjsZ10OQBLDkQdrpjkM0Okgmto429e07hMwLsrdxqTzaUsWSDJsFo507MMGqouyqNO-gAAh_E6I1h3v3pEhLCIDZfS_EyWYwU5YC_FN6yPUYdomaG1VXAWDWoOthC-_QgxLebX9f_f6ZAB4_zlt-R6kZYQ",
    "e": "AQAB",
    "ext": true,
    "key_ops": [
      "decrypt"
    ],
    "kty": "RSA",
    "n": "55oQnKZCK0xQQ_5YM4NRtPFAQCpiFHQwtkSezrC_oH3egEfd2D5z6qFitsLV-49C9i_pLDWSV2gjQ0XF5r1BQtdb0GFNHrRShPTd4g1wxCMFbqW9JtIyadN-E8vsWcTKf1LVCjrJwKsFA63RzqkGPw0UlpLu7J03BQNVT1j_ey51bsSEbbLDk8OmXwc9MRDal4vw_Vov8Pqo1HRsogHa0uy6vqUsCud27McsrmnTv8pmiUT6kvg8VKndGziau_1VsQ0rAmQH5dirlUFlx1NYaXbklhehHodVlY-mqj7lCCriUccvz59YOZ8PcpKwsR4oDXNKpInLnYENb4O46uDZfdtv_1WF74Cjo9ijQL9CvZk3IOBqQIMcS_Lz_Azjf3jg4CYV8rxaRN5HyIJAV7iB0-I0F60sNqP4eVi0HhwY2JrZD8wSjhFJVc_FqhkSnMRL9YChNbWoLC7jJfguvUpWMv1AgGyXsRP9dXojBFvqTPFPnvXFSKR5JB-Ft-vVVeZBEgE-44ahNlo0UUM3lVXDvpcD9uCv97hqob4ziutHifbvquyLz3zT2vdoMX--i04Bef7vjZ8mHLxTyEM4jX9HqUsgsZyx2iNU1kM2IPI1ptz7aOwwA_GbaVp9EUdlQpR7wgxhDnkOG0eZDhHQA9JZIk-zuQpfm-7fsnGpPJg6EQM",
    "p": "-wWWUc2r9ZzSTLSTpLpqYlAzg0bLmfRCRlKeFKZjx3HrNMQTmVbqj3lLEyqB_LV3WeG7fPDFs5S2b0_OdUz_2riGhGH2GVQ4OnphAFCL8b0kgu70ZJg0cqH_332EIC-P5DvzikrXcDloKHcpCj0E5fDu7gN_cdpDaUE7uoClgASIixieJnVpMhHHA7lyWFe4GwZzI3X83RXlB1dCQUlhjEUNRqNBTpUU1Y2rVDHzUKDnk3Aho8j5NvBjBf_c4Wa2r_z3uejWahurxrUkdox6VzkG9DQ10_2jkf9jPa6g2FgC-bkzM4xKMvtQQA-7ZeeEviJrpyD7rd3C3qwOmytwzw",
    "q": "7DHiXl4SKpfVU7A6tyVqYMl9fEYRMKJ0snXzK9j9w_FJ7twY94K9QxWdZ4CCvefNro0r4qc7TLIJHDPOVVohB2B0RjRZVXguBCDP2sJRuyXBlEQgUh-IQItD_QAMyvGlSynt3wMMVlVXvLEQf5JII9HzHjXzuUPD-kX9r-24-yYjB2ZVj4R9riG7A3exgLN6HNwQYL3z3ORkIUa03wKQrOuYZF0D9LvOhEbKu6bCS1BDCq8_EpyPkFBjQuDzgep8F9ej7lKUXQQRsNDNOLEtyycOYcvY-ee8KwiPaYIepA0iPrv1-FQ6VQFUbd6qRuvn9TO7KGir5jiFDJqbfinhjQ",
    "qi": "4W7wnjdlHSqiOOl4Qru8VEthMi8Mma9mJsx6xbVaDWopP6WZdTQTMV_dl0_cf9yP9FlY9EZhasKSt6oiWbkc7cil-WyDoEXRwmEejt3jJhtE9fz1ojWX_qYOTcPJY1hYGNtwWH_TqwjNoLbv6UQqt3TsvA2Z49El78FS98ba41NgkzrPhmElskVLXoFfEn9nVGGFCO2b-UVVHV0yQbhQZ8gOt4f5AgyDBYU4_VJDYeRKqaA8X9upyBOkFLlhsIR5V9NBkpkmunIqVLCZ4My739GVDWHbSB8sPltzu_bCp59JSnuBr30q8ZnS5wGuSxO7ecA303bisZYArFCpjjR1KQ"
  };

  publicKey = {
    "alg": "RSA-OAEP-256",
    "e": "AQAB",
    "ext": true,
    "key_ops": [
      "encrypt"
    ],
    "kty": "RSA",
    "n": "55oQnKZCK0xQQ_5YM4NRtPFAQCpiFHQwtkSezrC_oH3egEfd2D5z6qFitsLV-49C9i_pLDWSV2gjQ0XF5r1BQtdb0GFNHrRShPTd4g1wxCMFbqW9JtIyadN-E8vsWcTKf1LVCjrJwKsFA63RzqkGPw0UlpLu7J03BQNVT1j_ey51bsSEbbLDk8OmXwc9MRDal4vw_Vov8Pqo1HRsogHa0uy6vqUsCud27McsrmnTv8pmiUT6kvg8VKndGziau_1VsQ0rAmQH5dirlUFlx1NYaXbklhehHodVlY-mqj7lCCriUccvz59YOZ8PcpKwsR4oDXNKpInLnYENb4O46uDZfdtv_1WF74Cjo9ijQL9CvZk3IOBqQIMcS_Lz_Azjf3jg4CYV8rxaRN5HyIJAV7iB0-I0F60sNqP4eVi0HhwY2JrZD8wSjhFJVc_FqhkSnMRL9YChNbWoLC7jJfguvUpWMv1AgGyXsRP9dXojBFvqTPFPnvXFSKR5JB-Ft-vVVeZBEgE-44ahNlo0UUM3lVXDvpcD9uCv97hqob4ziutHifbvquyLz3zT2vdoMX--i04Bef7vjZ8mHLxTyEM4jX9HqUsgsZyx2iNU1kM2IPI1ptz7aOwwA_GbaVp9EUdlQpR7wgxhDnkOG0eZDhHQA9JZIk-zuQpfm-7fsnGpPJg6EQM"
  };
}

let encryptedData: string = "";

if (true) {
  encryptedData = "aULLLowCGDbRI/LUNRKCuqx4iDwZYTl1VC5ovZAeBz372ukEwstWkCRaeLbxxP5NGYJq510I9RtkbzJ6B9JwCyTezUQZLoN5uvwtnPqRdpLNoH4uzbd4oJzxjD0jE0MdzHNWcE0Ua3UrtK9UWePJJnCMUaAuy/Gm5AJ3rgGnF64PQzpVnVubmePMyssplI7qKdQGwL7/oM1LqT2ujYHL55DCddgmNj6Xae+mHBXtUZ2KYdB4YbfVH62nb+wTNJttVykWGFf9ApwTygKf1ALTbVi7IZnnB6Sn6bCtLQZHegsxzjAQBhbML1JJGbaRaZvOrW1RGriUwM22Iu1AYzqIdmmRsYuQX2t+cGN6UjOZKUeTDBmwJYG/BRsx2CqV71XNAQlX7ahwvLpXy2txzInISEInNNXEx3m4ic2rz5byyd/xoKXmr86MUjf1YBCpi+mRCt+e2qeIhrKQrmgXWfAx3IwnI5JBe6vG9qiQGoII4dRXQXnXO3LFV3r9CJa4MssPjHMewLKWxEpzJ30VEL0VsVF3gqjUrptsderXhx6QkPoTY13gAdT566agHjBkMrFHV+WOgjURH6iWJrClUcE007G9KMu2iojtQcXsZW5hZ6sJ2jfkeO8Zvz7MkOotD3AqJPR/0Hj1oSUDzElXprA443xn/8p9nJIfOxMGlBb65n8=";
  encryptedData = "jRv1WYlClBP1lvk+VSwIk9UMftUJJOa94eLqIg3AO7hhwn9XqMbp5cK0sqo8vwz3aKnTF994njt75JHohSVOm5/b+t3ep6GYT1hqRaXdDay4tyA1puTRh/qLv/C7aDwQmSvdffxeuZ4vBdO2cYkY/WlOvXTfHvbQ8WZYLW/V00cII9reirlCv00YTOCcTh/btoB5Sa+4CfRaIlb7kld+kjQK9dNir/uu1m0F8NTpAmG3pwMoiMiJoJOMHiFZtk9IwgMJdb8yxiR2ghBauO3c/Hw2ATEsS3sIVEQDe76NVYyokdjZNNfZqO+UJIqpCg6fM0flD1AXT5mTwdUfF+g9b5Z7llQ1xeHz3ij9pjUFtbf6s8KRHSlbNSYD7vRhXPL22YKXajS8KsnYeD1VCfQ7rRhAsg6JPkbtwTv/cgT4iz8fp28AuBLVckX9uPwraXyUN8HcRyxyRLdWv/PhA/AlF4TX7JuiliF7DysWJ+5TOryHaaVXVaTGxODZo9mpop2+VamsXVTrE27OtCGa0+k2ip8LfljkCYr8fnPPkY7esVNr1kDl+uN9SFaeyj7rBCh5dAPn7MXVNujv7tXtF7J+Nh7INZ2Jvh2E9cYGVVCmR9OAtR82o1M8JTCivCd6nnY6U4/OCMPYA7gNwdxzOWuINd6e8ksPfnI3aXocrOOhnSA=";
  encryptedData = "LJgj/Vnk7q8ji2ygJlx4si+2/PaR6gJgvIzl0ZjMzRvkRGIiiIX3I+XtGbLyvUiXT3pEBC3Ph0WDFfojU8KOHk7oh61vQ6VnmenhnmRtNELeHfyUTZz+1REo2EGLwZ8Qisdi1SsCKZuPMIHBEeUHjp493n0n9o3PY2c44eLA+2iZ1yTZRRJz0x1+prvcTby9FC+J6/fIBkwHJzNJYU7gxVfOKEoo1zGiJiDyAlL2lwXbU+GE6C1tbL7BhBibB6wsAKcs5vcciOG88qTR5JSPLBZcVabRggEqMv1c+VnvVVQbCAeN8bbV9WqJ9KqzGbdPX9zf0MbqPpbrPQbOn1YXr6WjtT69CCvnsp/cDqCF8b+j/g5s3n1SoocVH8gp3cQSS4yjkH2yOOTqQAPk0Mbj2vgBvzqD+zml0yUv/nU3qPxN+jBdhVRqJlh1a9BggiAdu0Tr7avwSerVzQ+H/Rr3clny/EzHhh9hakQYWr1qC2SDx5widXNVgc8DjO+0/r8j/jEbFM5OIn7CHPqfMuYQt8CanEsJT2eyidZ8Gxh8voWySmmEgZ2kBGeuCpFrOhnd539Yn9w6lkNFBTmTOfclZaKGTmpRr5cUgZEozY/ahEBetXQ/MluMDqr24g9ag/5Jqb/cjcmpy5S5m0zScIRczzc3ItgNAyocYKeOOYj3PDU=";
}

function updateTextbox(txtboxId: string, object: JsonWebKey | string | null) {
  const txtbox = document.querySelector(txtboxId);
  if (txtbox) {
    const data = (typeof object === 'string') ? object : JSON.stringify(object, null, " ");
    console.log("updating txtbox:" + txtboxId + " with " + data.substr(0, 80) + ((data.length > 80) ? "..." : ""));
    txtbox.textContent = data;
  } else {
    console.log("txtbox:" + txtboxId + " not found");
  }
}

updateTextbox("#exported-private-key", privateKey);
updateTextbox("#exported-public-key", publicKey);
updateTextbox("#encrypted-data", encryptedData);

const rsaFacade = new RsaFacade();

function populateKeys() {
  console.log("generating rsa keys");

  rsaFacade.generateKey()
    .then(keyPair => {

      rsaFacade.exportKey(keyPair.privateKey)
        .then(exportedKey => {
          updateTextbox("#exported-private-key", exportedKey);
          privateKey = <JsonWebKey>JSON.parse(exportedKey);
        });

      rsaFacade.exportKey(keyPair.publicKey)
        .then(exportedKey => {
          updateTextbox("#exported-public-key", exportedKey);
          publicKey = <JsonWebKey>JSON.parse(exportedKey);
        });
    })
}


if ((privateKey === null) && (publicKey === null)) {
  populateKeys();
} else {
  enum Operation {
    ENCRYPT,
    DECRYPT,
  }

  rsaFacade.importJsonWebKeys(privateKey, publicKey)
    .then(keypair => {
      const op: Operation = encryptedData ? Operation.DECRYPT : Operation.ENCRYPT;

      switch (+op) {
        case Operation.ENCRYPT:

          const enc = new TextEncoder();
          const encodedMsg = enc.encode("hello world\nhenry leong");

          rsaFacade.encrypt(keypair.publicKey, encodedMsg)
            .then(base64data => {
              updateTextbox('#encrypted-data', base64data)
            });

          break;
        case Operation.DECRYPT:
          console.log("decrypting...");

          rsaFacade.decrypt(keypair.privateKey, encryptedData)
            .then(base64data => {
              const dec = new TextDecoder();
              const data = dec.decode(base64data);
              updateTextbox('#decrypted-data', data)
            });
          break;
      }

    });

}

