import { GET_ALL_MARKETS_QUERY, GET_ALL_ENCRYPTED_MARKETS_QUERY } from "./silicon/silicon_query";
import { Silicon, instantiate_silicon } from "./silicon/silicon";
import { verifySiliconMapping } from "./silicon/silicon_utils"; 
import { EncryptedMarket, Market } from "../graphql/graphql";

(async () => {
    const transparent_silicon = await instantiate_silicon(GET_ALL_MARKETS_QUERY) as Silicon<Market>;
    const encrypted_silicon = await instantiate_silicon(GET_ALL_ENCRYPTED_MARKETS_QUERY) as Silicon<EncryptedMarket>;
    const isValidMapping =  verifySiliconMapping(encrypted_silicon, transparent_silicon);
    console.log(`Is valid mapping: ${isValidMapping}`);
})();
