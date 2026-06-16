// Frontend-only internationalisation for Disc Golf Manager.
//
// Framework-free: a pair of flat string dictionaries (English + Croatian) and a
// tiny `t()` lookup with {placeholder} interpolation. No React here so it stays
// unit-testable; the `useTranslation` hook wires it to the store's language.

export type Language = "en" | "hr";

/** Languages offered in the UI, in switcher order. */
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hr", label: "Hrvatski" },
];

export const DEFAULT_LANGUAGE: Language = "en";

type Dict = Record<string, string>;

const en: Dict = {
  // Chrome
  "app.title": "Disc Golf Manager",
  "language.label": "Language",
  "dashboard.title": "Dashboard",
  "dashboard.welcome": "Welcome to Disc Golf Manager.",
  "app.loading": "Loading saved game…",

  // New game / start screen + modal
  "newgame.heading": "🥏 Disc Golf Manager",
  "newgame.intro": "Build your club, win tournaments, and rise to the top.",
  "newgame.button": "New Game",
  "newgame.modalTitle": "New Game",
  "newgame.languageQuestion": "Choose your language",
  "newgame.clubName": "Club name",
  "newgame.clubNamePlaceholder": "New Club",
  "newgame.start": "Start Season",
  "newgame.cancel": "Cancel",

  // Guided flow — stepper labels
  "flow.step.shop": "Discs",
  "flow.step.training": "Training",
  "flow.step.tournament": "Tournament",

  // Flow — intro step
  "intro.title": "Welcome, manager!",
  "intro.body1": "Your club has {count} players: {names}.",
  "intro.body2":
    "First, buy three discs for each player — one Driver, one Midrange and one Putter — and equip them. That is {total} discs in total.",
  "intro.body3":
    "After that you'll train your players before every tournament. Win prize money and reputation to unlock bigger events. Good luck!",
  "intro.continue": "Go to the disc shop",

  // Flow — shop step extras
  "shop.progress": "Equipped {done} / {total} discs",
  "shop.hint":
    "Equip a Driver, Midrange and Putter on every player to continue.",
  "shop.continue": "Continue to training",

  // Flow — training step extras
  "training.intro": "Train your players before the next tournament.",
  "training.toTournament": "Go to tournament",
  "training.toShop": "Visit disc shop",

  // Flow — tournament step extras
  "tournament.intro": "Pick a tournament to enter this round.",

  // Season loop — status header
  "loop.club": "Club",
  "loop.money": "Money",
  "loop.reputation": "Reputation",
  "loop.season": "Season",
  "loop.round": "Round",

  // Season loop — select phase
  "loop.selectTitle": "Select a Tournament",
  "loop.tournamentMeta":
    "{holes} holes · difficulty {difficulty} · pool {pool} · entry {fee}",
  "loop.enter": "Enter",
  "loop.noFunds": "Not enough money for the {fee} entry fee.",
  "loop.cantEnter": "Could not enter that tournament.",
  "loop.entered":
    "Finished #{placement} — earned {earnings} and +{rep} reputation.",

  // Season loop — training phase
  "loop.trainingTitle": "Training",
  "loop.lastRound":
    "Last round: {name} — finished #{placement}, earned {earnings} and +{rep} reputation.",
  "loop.trainButton": "{type} ({cost})",
  "loop.trained": "{player}: {stat} +{boost} (now {newValue}) for {cost}.",
  "loop.noTrainFunds": "Not enough money for that training session.",
  "loop.nextRound": "Next Round",
  "loop.finishSeason": "Finish Season",

  // Season loop — complete phase
  "loop.seasonComplete": "Season {n} Complete",
  "loop.roundsPlayed": "Rounds played",
  "loop.wins": "Wins",
  "loop.bestFinish": "Best finish",
  "loop.totalEarnings": "Total earnings",
  "loop.reputationGained": "Reputation gained",
  "loop.startNextSeason": "Start Next Season",

  // Disc shop
  "shop.title": "🛒 Disc Shop",
  "shop.lead":
    "Buy discs to boost your players. Each disc type raises one stat; equip one disc per type per player.",
  "shop.catalogue": "Catalogue",
  "shop.filterLabel": "Filter by type",
  "shop.filterAll": "All types",
  "shop.quantityLabel": "Qty",
  "shop.buy": "Buy",
  "shop.buyTotal": "Buy ({total})",
  "shop.boughtMultiple": "Bought {qty} × {name}.",
  "shop.noFundsMultiple": "Not enough money for {qty} × {name} ({price}).",
  "shop.loadouts": "Loadouts",
  "shop.equipPlaceholder": "Equip…",
  "shop.unequip": "Unequip",
  "shop.discMeta": "{type} · {rarity} · +{bonus} · {price}",
  "shop.slot": "{type}: {value}",
  "shop.slotEquipped": "{name} (+{bonus})",
  "shop.empty": "—",
  "shop.noFunds": "Not enough money to buy {name} ({price}).",
  "shop.bought": "Bought {name}.",
  "shop.equipped": "Equipped {name} on {player}.",
  "shop.unequipped": "Unequipped {type} from {player}.",

  // Dashboard
  "dash.clubOverview": "Club Overview",
  "dash.players": "Players",
  "dash.tournaments": "Tournaments",
  "dash.training": "Training",
  "dash.inventory": "Inventory",
  "dash.name": "Name",
  "dash.noPlayers": "No players yet.",
  "dash.noTournaments": "No tournaments played yet.",
  "dash.noDiscs": "No discs owned yet.",
  "dash.playerStats":
    "DRV {drv} · ACC {acc} · PUT {put} · MEN {men} · STA {sta}",
  "dash.tournamentResult": "#{placement} · {earnings} · +{rep} rep",
  "dash.trainingItem": "trains {stat} · {cost}",
  "dash.inventoryItem": "{type} · {rarity} · +{bonus}",

  // Enum labels
  "discType.Driver": "Driver",
  "discType.Midrange": "Midrange",
  "discType.Putter": "Putter",
  "rarity.Common": "Common",
  "rarity.Rare": "Rare",
  "rarity.Pro": "Pro",
  "rarity.Signature": "Signature",
  "trainingType.Driving": "Driving",
  "trainingType.Accuracy": "Accuracy",
  "trainingType.Putting": "Putting",
  "trainingType.Mental": "Mental",
  "trainingType.Fitness": "Fitness",
  "stat.Driving": "Driving",
  "stat.Accuracy": "Accuracy",
  "stat.Putting": "Putting",
  "stat.Mental": "Mental",
  "stat.Stamina": "Stamina",
  "program.Driving": "Driving Range Session",
  "program.Accuracy": "Accuracy Drills",
  "program.Putting": "Putting Practice",
  "program.Mental": "Mental Coaching",
  "program.Fitness": "Fitness Training",
};

const hr: Dict = {
  // Chrome
  "app.title": "Disc Golf Manager",
  "language.label": "Jezik",
  "dashboard.title": "Nadzorna ploča",
  "dashboard.welcome": "Dobrodošli u Disc Golf Manager.",
  "app.loading": "Učitavanje spremljene igre…",

  // New game / start screen + modal
  "newgame.heading": "🥏 Disc Golf Manager",
  "newgame.intro": "Izgradi svoj klub, osvajaj turnire i popni se na vrh.",
  "newgame.button": "Nova igra",
  "newgame.modalTitle": "Nova igra",
  "newgame.languageQuestion": "Odaberi jezik",
  "newgame.clubName": "Ime kluba",
  "newgame.clubNamePlaceholder": "Novi klub",
  "newgame.start": "Započni sezonu",
  "newgame.cancel": "Odustani",

  // Guided flow — stepper labels
  "flow.step.shop": "Diskovi",
  "flow.step.training": "Trening",
  "flow.step.tournament": "Turnir",

  // Flow — intro step
  "intro.title": "Dobrodošao, menadžeru!",
  "intro.body1": "Tvoj klub ima {count} igrača: {names}.",
  "intro.body2":
    "Najprije svakom igraču kupi tri diska — Driver, Midrange i Putter — i opremi ih. To je ukupno {total} diskova.",
  "intro.body3":
    "Nakon toga prije svakog turnira treniraš igrače. Osvajaj nagrade i ugled da otključaš veće turnire. Sretno!",
  "intro.continue": "Idi u trgovinu diskova",

  // Flow — shop step extras
  "shop.progress": "Opremljeno {done} / {total} diskova",
  "shop.hint":
    "Opremi Driver, Midrange i Putter svakom igraču za nastavak.",
  "shop.continue": "Nastavi na trening",

  // Flow — training step extras
  "training.intro": "Treniraj igrače prije sljedećeg turnira.",
  "training.toTournament": "Idi na turnir",
  "training.toShop": "Posjeti trgovinu diskova",

  // Flow — tournament step extras
  "tournament.intro": "Odaberi turnir za ovo kolo.",

  // Season loop — status header
  "loop.club": "Klub",
  "loop.money": "Novac",
  "loop.reputation": "Ugled",
  "loop.season": "Sezona",
  "loop.round": "Kolo",

  // Season loop — select phase
  "loop.selectTitle": "Odaberi turnir",
  "loop.tournamentMeta":
    "{holes} rupa · težina {difficulty} · fond {pool} · kotizacija {fee}",
  "loop.enter": "Prijavi se",
  "loop.noFunds": "Nedovoljno novca za kotizaciju od {fee}.",
  "loop.cantEnter": "Nije moguće prijaviti se na taj turnir.",
  "loop.entered":
    "Završeno #{placement} — zarađeno {earnings} i +{rep} ugleda.",

  // Season loop — training phase
  "loop.trainingTitle": "Trening",
  "loop.lastRound":
    "Prošlo kolo: {name} — završeno #{placement}, zarađeno {earnings} i +{rep} ugleda.",
  "loop.trainButton": "{type} ({cost})",
  "loop.trained": "{player}: {stat} +{boost} (sada {newValue}) za {cost}.",
  "loop.noTrainFunds": "Nedovoljno novca za taj trening.",
  "loop.nextRound": "Sljedeće kolo",
  "loop.finishSeason": "Završi sezonu",

  // Season loop — complete phase
  "loop.seasonComplete": "Sezona {n} završena",
  "loop.roundsPlayed": "Odigrano kola",
  "loop.wins": "Pobjede",
  "loop.bestFinish": "Najbolji plasman",
  "loop.totalEarnings": "Ukupna zarada",
  "loop.reputationGained": "Stečeni ugled",
  "loop.startNextSeason": "Započni sljedeću sezonu",

  // Disc shop
  "shop.title": "🛒 Trgovina diskova",
  "shop.lead":
    "Kupuj diskove da poboljšaš igrače. Svaki tip diska diže jedan atribut; po igraču ide jedan disk po tipu.",
  "shop.catalogue": "Katalog",
  "shop.filterLabel": "Filtriraj po tipu",
  "shop.filterAll": "Svi tipovi",
  "shop.quantityLabel": "Kol.",
  "shop.buy": "Kupi",
  "shop.buyTotal": "Kupi ({total})",
  "shop.boughtMultiple": "Kupljeno {qty} × {name}.",
  "shop.noFundsMultiple": "Nedovoljno novca za {qty} × {name} ({price}).",
  "shop.loadouts": "Oprema",
  "shop.equipPlaceholder": "Opremi…",
  "shop.unequip": "Skini",
  "shop.discMeta": "{type} · {rarity} · +{bonus} · {price}",
  "shop.slot": "{type}: {value}",
  "shop.slotEquipped": "{name} (+{bonus})",
  "shop.empty": "—",
  "shop.noFunds": "Nedovoljno novca za kupnju: {name} ({price}).",
  "shop.bought": "Kupljeno: {name}.",
  "shop.equipped": "Opremljen {name} na {player}.",
  "shop.unequipped": "Skinut {type} s igrača {player}.",

  // Dashboard
  "dash.clubOverview": "Pregled kluba",
  "dash.players": "Igrači",
  "dash.tournaments": "Turniri",
  "dash.training": "Trening",
  "dash.inventory": "Inventar",
  "dash.name": "Ime",
  "dash.noPlayers": "Još nema igrača.",
  "dash.noTournaments": "Još nije odigran nijedan turnir.",
  "dash.noDiscs": "Još nema diskova.",
  "dash.playerStats":
    "DRV {drv} · ACC {acc} · PUT {put} · MEN {men} · STA {sta}",
  "dash.tournamentResult": "#{placement} · {earnings} · +{rep} ugleda",
  "dash.trainingItem": "trenira {stat} · {cost}",
  "dash.inventoryItem": "{type} · {rarity} · +{bonus}",

  // Enum labels
  "discType.Driver": "Driver",
  "discType.Midrange": "Midrange",
  "discType.Putter": "Putter",
  "rarity.Common": "Obični",
  "rarity.Rare": "Rijetki",
  "rarity.Pro": "Pro",
  "rarity.Signature": "Signature",
  "trainingType.Driving": "Driving",
  "trainingType.Accuracy": "Preciznost",
  "trainingType.Putting": "Putting",
  "trainingType.Mental": "Psiha",
  "trainingType.Fitness": "Kondicija",
  "stat.Driving": "Driving",
  "stat.Accuracy": "Preciznost",
  "stat.Putting": "Putting",
  "stat.Mental": "Psiha",
  "stat.Stamina": "Izdržljivost",
  "program.Driving": "Trening dalekometa",
  "program.Accuracy": "Vježbe preciznosti",
  "program.Putting": "Vježbe puttanja",
  "program.Mental": "Mentalni coaching",
  "program.Fitness": "Kondicijski trening",
};

const DICTS: Record<Language, Dict> = { en, hr };

/**
 * Look up a translation key for the given language, interpolating any
 * {placeholder} params. Falls back to English, then to the raw key, so a
 * missing translation degrades gracefully instead of throwing.
 */
export function t(
  language: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = DICTS[language] ?? en;
  let value = dict[key] ?? en[key] ?? key;
  if (params) {
    for (const name of Object.keys(params)) {
      value = value.split(`{${name}}`).join(String(params[name]));
    }
  }
  return value;
}
