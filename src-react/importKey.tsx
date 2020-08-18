import { inject } from "inversify";
import _ from "lodash";
import log from "loglevel";
import React, { ErrorInfo, ReactNode } from "react";
import Symbols from "../src/symbols";

export class ImportKeyButton extends React.Component {

    state: any;
    importKeyService: ImportKeyService;

    constructor(
        props: any,
        @inject(Symbols.ImportKeyService) importKeyService: ImportKeyService
    ) {
        super(props);

        this.onChangeHandler = this.onChangeHandler.bind(this);

        this.state = { error: null };
        this.importKeyService = importKeyService;
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            error: error
        });
        log.error(error.toString(), errorInfo.componentStack);
    }

    onChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
        e.preventDefault();

        log.info("fileList", e.target.files);

        _.forEach(e.target.files, file => {
            log.info(file);

            file.text()
                .then(buf => {
                    this.importKeyService.importKey(buf)
                        .then(cryptoKey => {
                            log.info("cryptokey", cryptoKey);
                        })
                        .catch(err => {
                            log.error("failed to import key", err);
                        });
                })
                .catch(err => {
                    log.error("failed to import key", err);
                    this.setState({ error: err });
                });
        });

    }

    render(): ReactNode {
        if (this.state.error) {
            return <p>failed to create component: importKey</p>;
        }

        return <input type="file" onChange={this.onChangeHandler} />;
    }

}