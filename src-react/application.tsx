import { ReactNode } from "react";
import React from "react";
import { GenerateKeyButton } from "./generateKey";
import { ImportKey } from "../src/crypto/ImportKey";
import { ImportKeyButton } from "./importKey";

export class Application extends React.Component {

    render(): ReactNode {
        return <div>
            <h1>hello world</h1>
            <GenerateKeyButton />
            <ImportKeyButton />
        </div>
    }
}
