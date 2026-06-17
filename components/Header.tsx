import LanguageSwitcher from "@/components/LanguageSwitcher";
import ResetButton from "@/components/ResetButton";
import Icon from "@/components/Icon";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <Icon name="disc" size={22} className="app-header-icon" />
        <h1>Disc Golf Manager</h1>
      </div>
      <div className="app-header-actions">
        <ResetButton />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
