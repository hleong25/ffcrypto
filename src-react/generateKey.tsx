import React, { ReactNode } from "react";
import "reflect-metadata";
import container from "../src/injections";
import Symbols from "../src/symbols";

export class GenerateKeyButton extends React.Component {

    cryptoService: ServiceCrypto;

    constructor(props: any) {
        super(props);

        this.onClickHandler = this.onClickHandler.bind(this);

        this.cryptoService = container.get<ServiceCrypto>(Symbols.AesGcmService);
    }


    onClickHandler(e: React.MouseEvent<HTMLButtonElement>) : void {
        e.preventDefault();
        this.cryptoService.generateKeys();
    }

    render(): ReactNode {
        return <button onClick={this.onClickHandler}>Generate Keys</button>;
    }

}