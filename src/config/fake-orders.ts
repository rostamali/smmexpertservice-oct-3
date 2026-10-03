export const FAKE_ORDER_SETTINGS = {
  enabled: true,
  mode: 'generated' as 'generated' | 'real-first',
  firstDelayMs: 4200,
  rotateEveryMs: 12000,
  transitionMs: 320,
  maxGeneratedOrders: 40,
  buyerMask: '****',
  titleSuffix: ' Purchase',
  defaultAccountName: 'Digital Account',
} as const;

// Easy customization:
// - Add/remove names here.
// - Only the name is shown, followed by FAKE_ORDER_SETTINGS.buyerMask.
// - Example: Wang -> Wang**** Purchase
export const FAKE_ORDER_NAMES = [
  'Wang','Liam','Noah','Oliver','James','Elijah','Mateo','Lucas','Henry','Theodore',
  'Jack','Levi','Alexander','Jackson','Daniel','Michael','Mason','Sebastian','Ethan','Logan',
  'Owen','Samuel','Jacob','Asher','Aiden','John','Joseph','Wyatt','David','Leo',
  'Luke','Julian','Hudson','Grayson','Matthew','Ezra','Gabriel','Carter','Isaac','Jayden',
  'Mila','Emma','Olivia','Amelia','Sophia','Charlotte','Ava','Isabella','Mia','Evelyn',
  'Luna','Camila','Sofia','Scarlett','Elizabeth','Eleanor','Emily','Chloe','Layla','Penelope',
  'Aria','Nora','Hazel','Ellie','Violet','Aurora','Lucy','Nova','Grace','Willow',
  'Aarav','Arjun','Ravi','Ayaan','Kabir','Yuki','Haru','Kenji','Minho','Jisoo',
  'Omar','Zayn','Yusuf','Adam','Ali','Hassan','Nadia','Sara','Maya','Lina',
  'Diego','Carlos','Marco','Luca','Enzo','Louis','Hugo','Theo','Felix','Oscar',
] as const;
