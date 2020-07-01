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

    encryptOnClickHandler(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();

        log.info("encrypting data...");

        const enc = new TextEncoder();
        const encodedMsg: Uint8Array = enc.encode(this.state.txtdata);

        this.cryptoService
            .encrypt('henry', encodedMsg)
            .then(buf => {
                log.info("henry", buf);
                // const base64str: string = BufUtils.base64encode(buf);
                // log.info("encrypt buf", base64str);
                // this.setState({ txtdata: base64str });
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
        // this.cryptoService.generateKeys();
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