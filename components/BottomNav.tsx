"use client";

import { useGameStore } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";
import Icon from "@/components/Icon";
import type { IconName } from "@/components/Icon";

interface BottomNavProps {
  onRankings: () => void;
  onHistory: () => void;
  onUpgrades: () => void; // reserved for future upgrades tab
}

interface NavTab {
  id: string;
  labelKey: string;
  icon: IconName;
  stage?: "shop" | "training" | "tournament";
  action?: "rankings" | "history" | "upgrades";
}

const TABS: NavTab[] = [
  { id: "shop",       labelKey: "nav.shop",       icon: "disc",    stage: "shop" },
  { id: "training",   labelKey: "nav.training",   icon: "flame",   stage: "training" },
  { id: "tournament", labelKey: "nav.tournament", icon: "trophy",  stage: "tournament" },
  { id: "club",       labelKey: "nav.club",        icon: "flag",    action: "upgrades" },
  { id: "rankings",   labelKey: "nav.rankings",   icon: "star",    action: "rankings" },
  { id: "history",    labelKey: "nav.history",    icon: "chart",   action: "history" },
];

export default function BottomNav({ onRankings, onHistory, onUpgrades }: BottomNavProps) {
  const { t } = useTranslation();
  const flowStage = useGameStore((s) => s.flowStage);
  const season = useGameStore((s) => s.season);
  const setFlowStage = useGameStore((s) => s.setFlowStage);

  const isActive = (tab: NavTab) => {
    if (tab.stage) return flowStage === tab.stage;
    return false;
  };

  const isDisabled = (tab: NavTab): boolean => {
    if (!tab.stage) return false;
    if (tab.stage === "shop") return false;
    if (tab.stage === "training") return season.phase !== "training" && season.phase !== "select";
    if (tab.stage === "tournament") return season.phase !== "select";
    return false;
  };

  const handleTab = (tab: NavTab) => {
    if (tab.action === "rankings") { onRankings();  return; }
    if (tab.action === "history")  { onHistory();   return; }
    if (tab.action === "upgrades") { onUpgrades();  return; }
    if (tab.stage && !isDisabled(tab)) setFlowStage(tab.stage);
  };

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map((tab) => {
        const active = isActive(tab);
        const disabled = isDisabled(tab);
        return (
          <button
            key={tab.id}
            className={`bottom-nav-tab${active ? " bottom-nav-tab--active" : ""}${disabled ? " bottom-nav-tab--disabled" : ""}`}
            onClick={() => handleTab(tab)}
            disabled={disabled}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={tab.icon} size={20} />
            <span className="bottom-nav-label">{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
