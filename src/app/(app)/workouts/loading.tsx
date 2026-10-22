export default function WorkoutsLoading() {
  return (
    <>
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="skeleton" style={{ width: 80, height: 12 }} />
          <span className="skeleton" style={{ width: 180, height: 26 }} />
        </div>
      </div>
      <div className="session-list">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="skeleton" style={{ height: 96, borderRadius: 18 }} />
        ))}
      </div>
    </>
  );
}
