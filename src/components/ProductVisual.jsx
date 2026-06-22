const ProductVisual = ({ type = "fridge", color = "#0067b1", compact = false }) => {
  const shell = {
    background: `linear-gradient(145deg, ${color} 0%, #0f172a 115%)`,
  };

  if (type === "tv") {
    return (
      <div className={`product-visual ${compact ? "scale-90" : ""}`} aria-hidden="true">
        <div className="tv-screen" style={shell}>
          <div className="tv-glow" />
          <div className="tv-line" />
        </div>
        <div className="tv-neck" />
        <div className="tv-base" />
      </div>
    );
  }

  if (type === "kettle") {
    return (
      <div className="product-visual kettle-wrap" aria-hidden="true">
        <div className="kettle-handle" />
        <div className="kettle-body" style={shell}>
          <div className="kettle-shine" />
        </div>
        <div className="kettle-spout" />
        <div className="kettle-lid" />
      </div>
    );
  }

  if (type === "cooler") {
    return (
      <div className="product-visual" aria-hidden="true">
        <div className="cooler" style={shell}>
          <div className="cooler-logo" />
          <div className="cooler-glass">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (type === "freezer") {
    return (
      <div className="product-visual freezer-wrap" aria-hidden="true">
        <div className="freezer" style={shell}>
          <div className="freezer-lid" />
          <div className="freezer-panel" />
        </div>
      </div>
    );
  }

  if (type === "washer") {
    return (
      <div className="product-visual" aria-hidden="true">
        <div className="washer" style={shell}>
          <div className="washer-panel" />
          <div className="washer-door" />
        </div>
      </div>
    );
  }

  if (type === "ac") {
    return (
      <div className="product-visual ac-wrap" aria-hidden="true">
        <div className="ac" style={shell}>
          <div className="ac-vent" />
        </div>
      </div>
    );
  }

  if (type === "microwave") {
    return (
      <div className="product-visual microwave-wrap" aria-hidden="true">
        <div className="microwave" style={shell}>
          <div className="microwave-window" />
          <div className="microwave-dials" />
        </div>
      </div>
    );
  }

  if (type === "fan") {
    return (
      <div className="product-visual fan-wrap" aria-hidden="true">
        <div className="fan-head" style={shell}>
          <div className="fan-blade blade-one" />
          <div className="fan-blade blade-two" />
          <div className="fan-blade blade-three" />
        </div>
        <div className="fan-stand" />
      </div>
    );
  }

  return (
    <div className="product-visual" aria-hidden="true">
      <div className="fridge" style={shell}>
        <div className="fridge-highlight" />
        <div className="fridge-seam" />
        <div className="fridge-display" />
      </div>
    </div>
  );
};

export default ProductVisual;
