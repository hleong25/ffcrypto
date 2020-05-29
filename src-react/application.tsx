import { ReactNode } from "react";
import React from "react";
import { GenerateKeyButton } from "./generateKey";

export class Application extends React.Component {

    render(): ReactNode {
        return <div>
            <h1>hello world</h1>
            <GenerateKeyButton />
        </div>
    }
}
