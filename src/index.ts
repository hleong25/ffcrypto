import log from "loglevel";

log.enableAll(false);

try {
    log.info("ffcrypto starting", (new Date).toISOString());

} catch (err) {
    log.error("Application crashed.", err);
}
