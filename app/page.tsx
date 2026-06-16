import SeasonLoop from "@/components/SeasonLoop";

export default function DashboardPage() {
  return (
    <section className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to Disc Golf Manager.</p>
      <SeasonLoop />
    </section>
  );
}
