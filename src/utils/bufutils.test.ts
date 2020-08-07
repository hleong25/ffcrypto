import { BufUtils } from "./bufutils";
import { Buffer } from "buffer";

describe("BufUtils tests", () => {

    const bufUtils: BufUtils = new BufUtils();

    test("string to buffer test", () => {

        const data: string = "hello world!"

        const buf: Buffer = bufUtils.str2buffer(data);
        const str: string = bufUtils.buffer2str(buf);

        expect(buf).not.toEqual(data);
        expect(str).toEqual(data);
    })

    test("base64 encode decode test", () => {

        const data_str: string = "hello world!";
        const data: Buffer = Buffer.from(data_str);

        const str: string = bufUtils.base64encode(data);
        expect(str).toEqual("aGVsbG8gd29ybGQh");

        const buf: Buffer = bufUtils.base64decode(str);
        expect(buf).toEqual(data);
    })



})
