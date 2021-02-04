import { LocalStorageFacade } from "./LocalStorageFacade";

let localStorageFacade: LocalStorageFacade = new LocalStorageFacade();

describe("LocalStorageFacade tests", () => {



    // beforeEach(() => {
    //     // localStorageFacade = new LocalStorageFacade();
    //     // values stored in tests will also be available in other tests unless you run
    //     // localStorage.clear();
    //     // // or directly reset the storage
    //     // localStorage.__STORE__ = {};
    //     // you could also reset all mocks, but this could impact your other mocks
    //     // jest.resetAllMocks();
    //     // or individually reset a mock used
    //     // localStorage.setItem.mockClear();
    // })

    test("test 1", () => {

        localStorageFacade.persist("key", "value");
    })

    // test("test 2", () => {

    //     localStorage.__

    //     localStorageFacade.fetch("key");
    // })
})