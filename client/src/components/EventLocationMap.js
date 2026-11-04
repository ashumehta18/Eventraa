import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function EventLocationMap({
  latitude = 28.7041,
  longitude = 77.1025,
  title = "Event Location",
  address = "",
  city = "",
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Prevent reinitializing if map already exists
    if (mapRef.current) return;

    const coords = [longitude, latitude];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // Free, no-auth map style
      center: coords,
      zoom: 13,
      pitch: 0,
      bearing: 0,
    });

    mapRef.current = map;

    // Add marker
    const marker = new maplibregl.Marker({ color: "#ff6b6b" })
      .setLngLat(coords)
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 10px; font-weight: bold;">${title}</div>
           ${address ? `<div style="font-size: 12px; color: #666;">${address}</div>` : ""}
           ${city ? `<div style="font-size: 12px; color: #666;">${city}</div>` : ""}`
        )
      )
      .addTo(map);

    // Open popup by default
    marker.getPopup().addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, title, address, city]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        marginTop: "20px",
      }}
    />
  );
}

export default EventLocationMap;
