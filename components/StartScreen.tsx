"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import NewGameModal from "@/components/NewGameModal";

/** Preseason landing screen: a single "New Game" button that opens the modal. */
export default function StartScreen() {
  const { t } = useTranslation();
  const [showNewGame, setShowNewGame] = useState(false);

  return (
    <section className="loop loop-start">
      <h2>{t("newgame.heading")}</h2>
      <p className="loop-lead">{t("newgame.intro")}</p>
      <button className="btn btn-primary" onClick={() => setShowNewGame(true)}>
        {t("newgame.button")}
      </button>
      {showNewGame ? (
        <NewGameModal onClose={() => setShowNewGame(false)} />
      ) : null}
    </section>
  );
}
