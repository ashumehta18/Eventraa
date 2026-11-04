import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function ExploreMapView({ events = [] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center (India)
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [77.1025, 28.7041],
      zoom: 5,
    });

    mapRef.current = map;

    // Add event markers
    events.forEach((event) => {
      const lat =
        event.location?.coordinates?.lat ||
        (event.location?.city === "Mumbai" ? 19.076 : null) ||
        (event.location?.city === "Bangalore" ? 12.9716 : null) ||
        (event.location?.city === "Delhi" ? 28.7041 : null) ||
        (event.location?.city === "Goa" ? 15.2993 : null) ||
        (event.location?.city === "Hyderabad" ? 17.3850 : null) ||
        28.7041;

      const lng =
        event.location?.coordinates?.lng ||
        (event.location?.city === "Mumbai" ? 72.8479 : null) ||
        (event.location?.city === "Bangalore" ? 77.5946 : null) ||
        (event.location?.city === "Delhi" ? 77.1025 : null) ||
        (event.location?.city === "Goa" ? 73.7997 : null) ||
        (event.location?.city === "Hyderabad" ? 78.4711 : null) ||
        77.1025;

      const marker = new maplibregl.Marker({
        color: "#ff6b6b",
        scale: 0.8,
      })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 10px; max-width: 250px;">
              <img src="${event.image}" alt="${event.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" />
              <h4 style="margin: 8px 0 4px 0; font-weight: bold;">${event.title}</h4>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                📅 ${
                  event.date
                    ? new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "TBD"
                }
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                📍 ${event.location?.city || event.location}
              </p>
              <button onclick="window.location.href = '/event/${event._id || event.id}'" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                margin-top: 8px;
                width: 100%;
              ">View Details</button>
            </div>`
          )
        )
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [events]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "600px",
        borderRadius: "8px",
        border: "1px solid #ddd",
      }}
    />
  );
}

export default ExploreMapView;
