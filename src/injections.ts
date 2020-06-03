import { Container } from "inversify";
import "reflect-metadata";
import Symbols from "./symbols";
import { AesGcmService } from "./crypto/impl/AesGcmService";

var container = new Container();
container.bind<ServiceCrypto>(Symbols.AesGcmService).to(AesGcmService);

export default container;
