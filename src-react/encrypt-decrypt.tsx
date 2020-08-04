import React, { ErrorInfo, ReactNode } from "react";
import container from "../src/injections";
import Symbols from "../src/symbols";
import log from "loglevel";
import { BufUtils } from "../src/utils/bufutils";

export class EncryptDecryptPanel extends React.Component {

    state: any;
    cryptoService: ServiceCrypto;

    constructor(props: any) {
        super(props);

        this.encryptOnClickHandler = this.encryptOnClickHandler.bind(this);
        this.decryptOnClickHandler = this.decryptOnClickHandler.bind(this);
        this.txtdataOnChangeHandler = this.txtdataOnChangeHandler.bind(this);

        this.state = {
            hasErrors: false,
            txtdata: "hello world!",
        };

        this.cryptoService = container.get<ServiceCrypto>(Symbols.AesGcmService);
        this.cryptoService.loadKeys();
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ hasErrors: true });
        log.error(error.toString(), errorInfo.componentStack);
    }

    getPassphrase(): string {
        return "henry";
    }

    encryptOnClickHandler(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();

        log.info("encrypting data...");

        const enc = new TextEncoder();
        const encodedMsg: Uint8Array = enc.encode(this.state.txtdata);
        const passphrase = this.getPassphrase();

        this.cryptoService
            .encrypt(passphrase, encodedMsg)
            .then(buf => {
                const base64str: string = BufUtils.base64encode(buf);
                this.setState({ txtdata: base64str });
            })
            .catch(err => {
                log.error("failed to encrypt data", err);
            })
            .finally(() => {
                log.info("finished encrypting data");
            });
    }

    decryptOnClickHandler(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();

        log.info("decrypting data...");

        const encodedMsg: string = this.state.txtdata;
        const passphrase = this.getPassphrase();

        this.cryptoService
            .decrypt(passphrase, encodedMsg)
            .then(buf => {
                const base64str: string = BufUtils.ab2str(buf);
                this.setState({ txtdata: base64str });
            })
            .catch(err => {
                log.error("failed to decrypt data", err);
            })
            .finally(() => {
                log.info("finished decrypting data");
            });
    }

    txtdataOnChangeHandler(e: React.ChangeEvent<HTMLTextAreaElement>): void {
        e.preventDefault();
        this.setState({ txtdata: e.target.value });
    }

    render(): ReactNode {
        if (this.state.hasErrors) {
            return <p>failed to create component: encrypt decrypt panel</p>;
        }

        return <div>
            <div>
                <button onClick={this.encryptOnClickHandler}>Encrypt</button>
                <button onClick={this.decryptOnClickHandler}>Decrypt</button>
            </div>
            <textarea value={this.state.txtdata} onChange={this.txtdataOnChangeHandler}></textarea>
        </div>
    }

}