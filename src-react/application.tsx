import { ReactNode } from "react";
import React from "react";
import { GenerateKeyButton } from "./generateKey";
import { ImportKeyButton } from "./importKey";
import { EncryptDecryptPanel } from "./encrypt-decrypt";

export class Application extends React.Component {

    render(): ReactNode {
        return <div>
            <GenerateKeyButton />
            <ImportKeyButton />
            <br/>
            <EncryptDecryptPanel />
        </div>
    }
}
