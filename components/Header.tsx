import LanguageSwitcher from "@/components/LanguageSwitcher";
import ResetButton from "@/components/ResetButton";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <span aria-hidden>🥏</span>
        <h1>Disc Golf Manager</h1>
      </div>
      <div className="app-header-actions">
        <ResetButton />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
