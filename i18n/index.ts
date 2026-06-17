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
  "reset.label": "New game",
  "reset.confirm": "Reset the saved game and start over?",
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
    "First, buy three discs for each player — one Driver, one Midrange and one Putter — and equip them.",
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
  "training.discUnlockTitle": "New disc tier unlocked!",
  "training.discUnlockCta": "Tap to visit the shop →",

  // Flow — tournament step extras
  "tournament.intro": "Pick a tournament to enter this round.",
  "tournament.unlocked": "Unlocked!",
  "tournament.levelUpTitle": "Level up! New tournament unlocked:",
  "achievement.firstWin": "First Win",
  "achievement.threeTournaments": "3 Tournaments Played",
  "achievement.reputation100": "100 Reputation",
  "achievement.locked": "Locked",
  "loop.streak": "Streak",

  // Flow — results step
  "results.title": "Tournament Results",
  "results.subtitle": "{name} — final standings",
  "results.colPos": "#",
  "results.colPlayer": "Player",
  "results.colScore": "Score",
  "results.colEarnings": "Earnings",
  "results.colRating": "Rating",
  "results.you": "You",
  "results.clubTotal": "Your club earned {earnings} and +{rep} reputation.",
  "results.continue": "Continue",
  "playback.skip": "Skip",
  "playback.viewResults": "View Results",
  "playback.roundStarting": "Round {round} starting…",
  "rankings.title": "World Rankings",
  "rankings.subtitle": "{total} players ranked",
  "rankings.colName": "Player",
  "rankings.colRating": "Rating",
  "rankings.colOverall": "OVR",
  "rankings.close": "← Back",
  "rankings.button": "Rankings",

  // Season loop — status header
  "loop.club": "Club",
  "loop.money": "Money",
  "loop.reputation": "Reputation",
  "loop.season": "Season",
  "loop.round": "Round",

  // Season loop — select phase
  "loop.selectTitle": "Select a Tournament",
  "loop.tournamentMeta":
    "{rounds} rounds of {holes} holes · difficulty {difficulty} · pool {pool} · entry {fee}",
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
  "shop.discMeta": "{type} · {rarity} · +{bonus} {stat} · {price}",
  "shop.slot": "{type}: {value}",
  "shop.slotEquipped": "{name} (+{bonus})",
  "shop.empty": "—",
  "shop.noFunds": "Not enough money to buy {name} ({price}).",
  "shop.bought": "Bought {name}.",
  "shop.equipped": "Equipped {name} on {player}.",
  "shop.unequipped": "Unequipped {type} from {player}.",
  "shop.nextUnlock": "Reach {required} reputation to unlock {rarity} discs.",
  "shop.allUnlocked": "All disc tiers unlocked.",

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
    "PWR {pwr} · ACC {acc} · PUT {put} · SCR {scr} · CON {con} · MEN {men} · FIT {fit}",
  "dash.tournamentResult": "#{placement} · {earnings} · +{rep} rep",
  "player.rating": "Rating",
  "player.unrated": "Unrated",
  "player.specialty": "Specialty",
  "specialty.AllRounder":     "All Rounder",
  "specialty.PowerPlayer":    "Power Player",
  "specialty.Precision":      "Precision",
  "specialty.PuttingMachine": "Putting Machine",
  "specialty.Scrambler":      "Scrambler",
  "specialty.MentalGame":     "Mental Game",
  "specialty.Workhorse":      "Workhorse",
  "player.consistency": "Consistency",
  "player.overview": "Overview",
  "player.careerStats": "Career Stats",
  "player.tournamentsPlayed": "Played",
  "player.wins": "Wins",
  "player.podiums": "Podiums",
  "player.totalEarnings": "Earnings",
  "player.bestPlacement": "Best Finish",
  "player.statProgression": "Stat Progression",
  "player.progressionHint": "Complete a season to see your progression charts.",
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
  "trainingType.Power": "Power",
  "trainingType.Accuracy": "Accuracy",
  "trainingType.Putting": "Putting",
  "trainingType.Scramble": "Scramble",
  "trainingType.Consistency": "Consistency",
  "trainingType.Mental": "Mental",
  "trainingType.Fitness": "Fitness",
  "stat.power": "Power",
  "stat.accuracy": "Accuracy",
  "stat.putting": "Putting",
  "stat.scramble": "Scramble",
  "stat.consistency": "Consistency",
  "stat.mental": "Mental",
  "stat.fitness": "Fitness",
  "stat.power.tooltip": "Drive distance and throw power off the tee. Affects long-range shots.",
  "stat.accuracy.tooltip": "Disc placement accuracy on fairways. Highest weight in hole simulation (30%).",
  "stat.putting.tooltip": "Short-range putting success. Second highest weight in simulation (25%).",
  "stat.scramble.tooltip": "Recovery from difficult lies and out-of-position shots (10%).",
  "stat.consistency.tooltip": "Steady performance under pressure. Reduces variance across holes (10%).",
  "stat.mental.tooltip": "Focus and composure during critical moments. Affects clutch performance (10%).",
  "stat.fitness.tooltip": "Stamina and endurance. Protects against stat decay over long rounds.",
  "program.Power": "Power Training",
  "program.Accuracy": "Accuracy Drills",
  "program.Putting": "Putting Practice",
  "program.Scramble": "Scramble Drills",
  "program.Consistency": "Consistency Coaching",
  "program.Mental": "Mental Coaching",
  "program.Fitness": "Fitness Training",
  // Injuries
  "injury.title": "Active Injuries",
  "injury.none": "No active injuries",
  "injury.weeksRemaining": "{weeks}w left",
  "injury.penalty": "−{pts} pts performance",
  "injury.new.title": "Injury Report",
  "injury.new.item": "{name} — {desc} ({weeks}w out)",
  "injury.new.medical": "Medical Team reduces recovery time.",
  // Tournament history
  "player.tournamentHistory": "Rating Trend",
  "player.noTournamentHistory": "Play tournaments to see your rating trend.",
  "player.tournamentHistoryLabel": "T{round}",
  // Club history
  "history.title": "Club History",
  "history.button": "History",
  "history.close": "← Back",
  "history.noHistory": "Complete a season to see club history.",
  "history.colSeason": "Season",
  "history.colPlayed": "Played",
  "history.colWins": "Wins",
  "history.colBest": "Best",
  "history.colEarnings": "Earnings",
  "history.colRep": "Rep+",
  "history.chartEarnings": "Season Earnings",
  "history.chartReputation": "End Reputation",
  // Club upgrades
  "upgrades.title": "Club Facilities",
  "upgrades.button": "Facilities",
  "upgrades.close": "← Back",
  "upgrades.level": "Level {level} / {max}",
  "upgrades.maxed": "Maxed",
  "upgrades.buy": "Upgrade ({cost})",
  "upgrades.noFunds": "Not enough funds.",
  "upgrades.training-center.name": "Training Center",
  "upgrades.training-center.desc": "Reduces training session costs.",
  "upgrades.training-center.effect1": "−15% training cost",
  "upgrades.training-center.effect2": "−30% training cost",
  "upgrades.video-analysis.name": "Video Analysis",
  "upgrades.video-analysis.desc": "Extra stat boost on every training session.",
  "upgrades.video-analysis.effect1": "+1 bonus boost",
  "upgrades.video-analysis.effect2": "+2 bonus boost",
  "upgrades.medical-team.name": "Medical Team",
  "upgrades.medical-team.desc": "Faster recovery from injuries.",
  "upgrades.medical-team.effect1": "+1 week recovery per round",
  "upgrades.medical-team.effect2": "+2 weeks recovery per round",
  "upgrades.club-sponsor.name": "Club Sponsor",
  "upgrades.club-sponsor.desc": "Sponsor pays part of tournament entry fees.",
  "upgrades.club-sponsor.effect1": "−10% entry fee",
  "upgrades.club-sponsor.effect2": "−20% entry fee",
  // Bottom navigation
  "nav.shop": "Shop",
  "nav.training": "Training",
  "nav.tournament": "Tournament",
  "nav.rankings": "Rankings",
  "nav.history": "History",
};

const hr: Dict = {
  // Chrome
  "app.title": "Disc Golf Manager",
  "language.label": "Jezik",
  "reset.label": "Nova igra",
  "reset.confirm": "Resetirati spremljenu igru i početi ispočetka?",
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
    "Najprije svakom igraču kupi tri diska — Driver, Midrange i Putter — i opremi ih.",
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
  "training.discUnlockTitle": "Nova razina diskova otključana!",
  "training.discUnlockCta": "Klikni za odlazak u trgovinu →",

  // Flow — tournament step extras
  "tournament.intro": "Odaberi turnir za ovo kolo.",
  "tournament.unlocked": "Otključano!",
  "tournament.levelUpTitle": "Level up! Novi turnir otključan:",
  "achievement.firstWin": "Prva pobjeda",
  "achievement.threeTournaments": "3 odigrana turnira",
  "achievement.reputation100": "100 reputacije",
  "achievement.locked": "Zaključano",
  "loop.streak": "Niz",

  // Flow — results step
  "results.title": "Rezultati turnira",
  "results.subtitle": "{name} — konačni poredak",
  "results.colPos": "#",
  "results.colPlayer": "Igrač",
  "results.colScore": "Skor",
  "results.colEarnings": "Zarada",
  "results.colRating": "Rating",
  "results.you": "Vi",
  "results.clubTotal": "Tvoj klub zaradio je {earnings} i +{rep} ugleda.",
  "results.continue": "Nastavi",
  "playback.skip": "Preskoči",
  "playback.viewResults": "Pogledaj rezultate",
  "playback.roundStarting": "Počinje runda {round}…",
  "rankings.title": "Svjetska rang lista",
  "rankings.subtitle": "{total} igrača rangirano",
  "rankings.colName": "Igrač",
  "rankings.colRating": "Rating",
  "rankings.colOverall": "OVR",
  "rankings.close": "← Natrag",
  "rankings.button": "Rang lista",

  // Season loop — status header
  "loop.club": "Klub",
  "loop.money": "Novac",
  "loop.reputation": "Ugled",
  "loop.season": "Sezona",
  "loop.round": "Kolo",

  // Season loop — select phase
  "loop.selectTitle": "Odaberi turnir",
  "loop.tournamentMeta":
    "{rounds} kola od {holes} rupa · težina {difficulty} · fond {pool} · kotizacija {fee}",
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
  "shop.discMeta": "{type} · {rarity} · +{bonus} {stat} · {price}",
  "shop.slot": "{type}: {value}",
  "shop.slotEquipped": "{name} (+{bonus})",
  "shop.empty": "—",
  "shop.noFunds": "Nedovoljno novca za kupnju: {name} ({price}).",
  "shop.bought": "Kupljeno: {name}.",
  "shop.equipped": "Opremljen {name} na {player}.",
  "shop.unequipped": "Skinut {type} s igrača {player}.",
  "shop.nextUnlock": "Dostignite {required} ugleda za otključavanje {rarity} diskova.",
  "shop.allUnlocked": "Svi nivoi diskova su otključani.",

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
    "SNG {pwr} · TOC {acc} · PUT {put} · IMP {scr} · KON {con} · PSI {men} · KND {fit}",
  "dash.tournamentResult": "#{placement} · {earnings} · +{rep} ugleda",
  "player.rating": "Rating",
  "player.unrated": "Bez ratinga",
  "player.specialty": "Specijalnost",
  "specialty.AllRounder":     "Svestrani",
  "specialty.PowerPlayer":    "Snaga",
  "specialty.Precision":      "Preciznost",
  "specialty.PuttingMachine": "Putter",
  "specialty.Scrambler":      "Improvizator",
  "specialty.MentalGame":     "Mentalitet",
  "specialty.Workhorse":      "Radišan",
  "player.consistency": "Konzistentnost",
  "player.overview": "Pregled",
  "player.careerStats": "Karijerna statistika",
  "player.tournamentsPlayed": "Odigrano",
  "player.wins": "Pobjede",
  "player.podiums": "Podiji",
  "player.totalEarnings": "Zarada",
  "player.bestPlacement": "Najbolji plasman",
  "player.statProgression": "Napredak atributa",
  "player.progressionHint": "Završi sezonu kako bi vidio grafove napretka.",
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
  "trainingType.Power": "Driving",
  "trainingType.Accuracy": "Preciznost",
  "trainingType.Putting": "Putting",
  "trainingType.Scramble": "Improvizacija",
  "trainingType.Consistency": "Konzistentnost",
  "trainingType.Mental": "Psiha",
  "trainingType.Fitness": "Kondicija",
  "stat.power": "Driving",
  "stat.accuracy": "Preciznost",
  "stat.putting": "Putting",
  "stat.scramble": "Improvizacija",
  "stat.consistency": "Konzistentnost",
  "stat.mental": "Psiha",
  "stat.fitness": "Kondicija",
  "stat.power.tooltip": "Daljina bacanja i snaga s tee pozicije. Utječe na dugačke udarce.",
  "stat.accuracy.tooltip": "Točnost postavljanja diska na fairwayu. Najviši utjecaj u simulaciji rupe (30%).",
  "stat.putting.tooltip": "Uspješnost kratkih puttova. Drugi po utjecaju u simulaciji (25%).",
  "stat.scramble.tooltip": "Oporavak s težih pozicija i loših udaraca (10%).",
  "stat.consistency.tooltip": "Stabilna izvedba pod pritiskom. Smanjuje varijanse kroz rupe (10%).",
  "stat.mental.tooltip": "Fokus i smirenost u ključnim trenucima. Utječe na izvedbu pod pritiskom (10%).",
  "stat.fitness.tooltip": "Izdržljivost i kondicija. Štiti od pada atributa u dugim rundama.",
  "program.Power": "Trening snage",
  "program.Accuracy": "Vježbe točnosti",
  "program.Putting": "Vježbe puttanja",
  "program.Scramble": "Vježbe improvizacije",
  "program.Consistency": "Trening konzistentnosti",
  "program.Mental": "Mentalni coaching",
  "program.Fitness": "Kondicijski trening",
  // Ozljede
  "injury.title": "Aktivne ozljede",
  "injury.none": "Nema aktivnih ozljeda",
  "injury.weeksRemaining": "{weeks}t ostalo",
  "injury.penalty": "−{pts} bodova izvedbe",
  "injury.new.title": "Izvješće o ozljedama",
  "injury.new.item": "{name} — {desc} ({weeks}t van)",
  "injury.new.medical": "Medicinski tim ubrzava oporavak.",
  // Povijest turnira
  "player.tournamentHistory": "Trend ratinga",
  "player.noTournamentHistory": "Igraj turnire kako bi vidio trend ratinga.",
  "player.tournamentHistoryLabel": "T{round}",
  // Povijest kluba
  "history.title": "Povijest kluba",
  "history.button": "Povijest",
  "history.close": "← Natrag",
  "history.noHistory": "Završi sezonu kako bi vidio povijest kluba.",
  "history.colSeason": "Sezona",
  "history.colPlayed": "Odig.",
  "history.colWins": "Pob.",
  "history.colBest": "Plasman",
  "history.colEarnings": "Zarada",
  "history.colRep": "Ugled+",
  "history.chartEarnings": "Zarada po sezoni",
  "history.chartReputation": "Ukupni ugled",
  // Nadogradnje kluba
  "upgrades.title": "Klupski objekti",
  "upgrades.button": "Objekti",
  "upgrades.close": "← Natrag",
  "upgrades.level": "Razina {level} / {max}",
  "upgrades.maxed": "Maksimum",
  "upgrades.buy": "Nadogradi ({cost})",
  "upgrades.noFunds": "Nedovoljno sredstava.",
  "upgrades.training-center.name": "Trening centar",
  "upgrades.training-center.desc": "Smanjuje troškove treninga.",
  "upgrades.training-center.effect1": "−15% troška treninga",
  "upgrades.training-center.effect2": "−30% troška treninga",
  "upgrades.video-analysis.name": "Video analiza",
  "upgrades.video-analysis.desc": "Dodatni bonus na svaki trening.",
  "upgrades.video-analysis.effect1": "+1 bonus stat",
  "upgrades.video-analysis.effect2": "+2 bonus stat",
  "upgrades.medical-team.name": "Medicinski tim",
  "upgrades.medical-team.desc": "Brži oporavak od ozljeda.",
  "upgrades.medical-team.effect1": "+1 tjedan oporavka po kolu",
  "upgrades.medical-team.effect2": "+2 tjedna oporavka po kolu",
  "upgrades.club-sponsor.name": "Klupski sponzor",
  "upgrades.club-sponsor.desc": "Sponzor plaća dio kotizacije za turnire.",
  "upgrades.club-sponsor.effect1": "−10% kotizacije",
  "upgrades.club-sponsor.effect2": "−20% kotizacije",
  // Donja navigacija
  "nav.shop": "Dućan",
  "nav.training": "Trening",
  "nav.tournament": "Turnir",
  "nav.rankings": "Rang lista",
  "nav.history": "Povijest",
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
