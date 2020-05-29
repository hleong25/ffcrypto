import React, { ReactNode } from "react";
import log from "loglevel";
import { injectable } from "inversify";

export class GenerateKeyButton extends React.Component {

    onClickHandler(e : React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        log.info("hello world");
    }

    render(): ReactNode {
        return <button onClick={this.onClickHandler}>Generate Keys</button>;
    }

}