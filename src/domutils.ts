import log from "loglevel";

export function updateTextbox(txtboxId: string, object: JsonWebKey | string | null) {
  const txtbox = document.querySelector(txtboxId);
  if (txtbox) {
    const data = (typeof object === 'string') ? object : JSON.stringify(object, null, " ");
    log.log("updating txtbox:" + txtboxId + " with " +  data.substr(0, 80) + ((data.length > 80) ? "..." : ""));
    txtbox.textContent = data;
  } else {
    log.log("txtbox:" + txtboxId + " not found");
  }
}
