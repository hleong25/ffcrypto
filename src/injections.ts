import { Container } from "inversify";
import "reflect-metadata";
import Symbols from "./symbols";
import { AesGcmService } from "./crypto/impl/AesGcmService";
import { ImportKeyServiceImpl } from "./crypto/impl/ImportKeyServiceImpl";
import { BufUtils } from "./utils/bufutils";

var container = new Container();
container.bind<BufUtils>(Symbols.BufUtils).to(BufUtils);
container.bind<ServiceCrypto>(Symbols.AesGcmService).to(AesGcmService);
container.bind<ImportKeyService>(Symbols.ImportKeyService).to(ImportKeyServiceImpl);

export default container;
