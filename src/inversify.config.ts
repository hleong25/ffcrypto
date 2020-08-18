import { Container } from "inversify";
import "reflect-metadata";
import { AesGcmService } from "./crypto/impl/AesGcmService";
import { ImportKeyServiceImpl } from "./crypto/impl/ImportKeyServiceImpl";
import { LocalStorageFacade } from "./persist/LocalStorageFacade";
import Symbols from "./symbols";
import { BufUtils } from "./utils/bufutils";

var container = new Container();
container.bind<LocalStorageFacade>(Symbols.LocalStorageFacade).to(LocalStorageFacade);
container.bind<BufUtils>(Symbols.BufUtils).to(BufUtils);
container.bind<ServiceCrypto>(Symbols.AesGcmService).to(AesGcmService);
container.bind<ImportKeyService>(Symbols.ImportKeyService).to(ImportKeyServiceImpl);

export default container;
