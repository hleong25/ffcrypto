import { injectable } from "inversify";
import _ from "lodash";
import log from "loglevel";

interface PersistData {
    timestamp: number,
    data: any,
}

@injectable()
export class LocalStorageFacade {

    getLocalStorage(): Storage {
        return localStorage;
    }

    persist(key: string, value: any) {
        let data: PersistData = {
            timestamp: _.now(),
            data: value,
        };

        log.debug("local persist key:" + key);

        let jsonData = JSON.stringify(data);

        log.info("local persist timestamp:" + (new Date(data.timestamp)).toISOString()
            + " key:" + key + " value-type:" + typeof value);
        // log.debug("local persist value: " + value);

        this.getLocalStorage().setItem(key, jsonData);
    }

    fetch(key: string): any {
        log.debug("local fetch key:" + key);
        let str = this.getLocalStorage().getItem(key);
        let data: PersistData = str && JSON.parse(str);

        if (data === null) {
            return null;
        }

        log.info("local fetch timestamp:" + (new Date(data.timestamp)).toISOString() + " key:" + key);
        // log.debug("local fetch value: " + data.data);

        return data.data;
    }


}