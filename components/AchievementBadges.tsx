import type { Achievement } from "@/game/achievements";
import { useTranslation } from "@/hooks/useTranslation";

/** Row of achievement badges — unlocked ones are lit up, locked ones stay dim. */
export default function AchievementBadges({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const { t } = useTranslation();

  return (
    <div className="achievement-row">
      {achievements.map((achievement) => (
        <span
          key={achievement.id}
          className={`achievement-badge${
            achievement.unlocked ? " achievement-unlocked" : " achievement-locked"
          }`}
          title={
            achievement.unlocked
              ? t(achievement.nameKey)
              : `${t(achievement.nameKey)} (${t("achievement.locked")})`
          }
        >
          {achievement.icon}
        </span>
      ))}
    </div>
  );
}
