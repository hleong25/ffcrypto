import log from "loglevel";
import { main } from "./main";

log.enableAll();

try {
    log.info("ffcrypto starting " + (new Date).toISOString());

    main();

} catch (err) {
    log.error("Application crashed");
    log.error(err);
}
