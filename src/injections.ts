import "reflect-metadata";
import { Container } from "inversify"
import { AesGcmService } from "./crypto/impl/AesGcmService";
import Symbols from "./symbols";

var container = new Container();
container.bind<ServiceCrypto>(Symbols.AesGcmService).to(AesGcmService);

export default container;
