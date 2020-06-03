import log from "loglevel";
import React, { ErrorInfo, ReactNode } from "react";
import "reflect-metadata";
import container from "../src/injections";
import Symbols from "../src/symbols";

export class GenerateKeyButton extends React.Component {

    state: any;
    cryptoService: ServiceCrypto;

    constructor(props: any) {
        super(props);

        this.onClickHandler = this.onClickHandler.bind(this);

        this.state = { hasErrors: false };
        this.cryptoService = container.get<ServiceCrypto>(Symbols.AesGcmService);
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ hasErrors: true });
        log.error(error.toString(), errorInfo.componentStack);
    }

    onClickHandler(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();
        this.cryptoService.generateKeys();
    }

    render(): ReactNode {
        if (this.state.hasErrors) {
            return <p>failed to create component: generateKey</p>;
        }

        return <button onClick={this.onClickHandler}>Generate Keys</button>;
    }

}