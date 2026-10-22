export default function DashboardLoading() {
  return (
    <>
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="skeleton" style={{ width: 120, height: 12 }} />
          <span className="skeleton" style={{ width: 220, height: 26 }} />
        </div>
      </div>
      <div className="kpi-row">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="skeleton" style={{ height: 128, borderRadius: 18 }} />
        ))}
      </div>
      <div className="dash-grid">
        <span className="skeleton" style={{ height: 380, borderRadius: 20 }} />
        <span className="skeleton" style={{ height: 380, borderRadius: 20 }} />
      </div>
      <div className="dash-grid dash-grid--3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="skeleton" style={{ height: 260, borderRadius: 20 }} />
        ))}
      </div>
    </>
  );
}
