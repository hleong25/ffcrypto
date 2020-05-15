import log from "loglevel";
import _ from "lodash";

export function updateTextbox(txtboxId: string, object: any) {
  const txtbox = document.querySelector(txtboxId);

  if (txtbox) {
    const data = (typeof object === 'string') ? object : JSON.stringify(object, null, " ");
    log.log("updating txtbox:" + txtboxId + " with " + data.substr(0, 80) + ((data.length > 80) ? "..." : ""));
    txtbox.textContent = data;
  } else {
    log.log("txtbox:" + txtboxId + " not found");
  }
}

export function getComponentById(id: string): Element | null {
  let elem = document.getElementById(id);
  if (elem) {
    return elem;
  } else {
    log.warn("failed to get component by id:" + id);
    return null;
  }
}