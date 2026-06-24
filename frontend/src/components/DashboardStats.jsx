export function DashboardStats({ stats, cardClassName, mutedClassName }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className={`min-h-24 rounded-lg border p-4 ${cardClassName}`}
        >
          <p className={`text-sm font-medium ${mutedClassName}`}>
            {stat.label}
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <h2 className={`text-2xl font-bold ${stat.accent}`}>
              {stat.value}
            </h2>
            <span className={`text-right text-xs ${mutedClassName}`}>
              {stat.detail || stat.helper}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
