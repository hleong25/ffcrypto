import log from "loglevel";
import _ from "lodash";

interface PersistData {
    timestamp: number,
    data: string,
}

export function localPersist(key: string, value: string) {
    let data: PersistData = {
        timestamp: _.now(),
        data: value,
    };

    log.debug("local persist key:" + key);

    let jsonData = JSON.stringify(data);

    log.info("local persist timestamp:" + (new Date(data.timestamp)).toISOString() + " key:" + key);
    log.debug("local persist value: " + value);

    window.localStorage.setItem(key, jsonData);
}

export function localFetch(key: string): any {
    log.debug("local fetch key:" + key);
    let str = window.localStorage.getItem(key) || '';

    let data: PersistData = JSON.parse(str);

    log.info("local fetch timestamp:" + (new Date(data.timestamp)).toISOString() + " key:" + key); 
    log.debug("local fetch value: " + data);

    return data.data;
}


export function localPersistJson(key: string, value: object) {
    let str = JSON.stringify(value);
    localPersist(key, str);
}

export function localFetchJson(key: string): any {
    let data: PersistData = localFetch(key);
    return JSON.parse(data.data);
}
