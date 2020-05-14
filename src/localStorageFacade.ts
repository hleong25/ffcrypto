import log from "loglevel";
import _ from "lodash";

export namespace LocalStorageFacade {

    interface PersistData {
        timestamp: number,
        data: any,
    }

    export function persist(key: string, value: any) {
        let data: PersistData = {
            timestamp: _.now(),
            data: value,
        };

        log.debug("local persist key:" + key);

        let jsonData = JSON.stringify(data);

        log.info("local persist timestamp:" + (new Date(data.timestamp)).toISOString() 
        + " key:" + key + " value-type:" + typeof value);
        // log.debug("local persist value: " + value);

        window.localStorage.setItem(key, jsonData);
    }

    export function fetch(key: string): any {
        log.debug("local fetch key:" + key);
        let str = window.localStorage.getItem(key) || '';

        let data: PersistData = JSON.parse(str);

        log.info("local fetch timestamp:" + (new Date(data.timestamp)).toISOString() + " key:" + key);
        // log.debug("local fetch value: " + data.data);

        return data.data;
    }

}