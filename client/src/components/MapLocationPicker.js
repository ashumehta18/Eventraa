import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // Delhi fallback
const SEARCH_DEBOUNCE = 350;
const NOMINATIM_SEARCH = (q) =>
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q
  )}&addressdetails=1&limit=5`;
const NOMINATIM_REVERSE = (lat, lon) =>
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

function MapLocationPicker({
  initialLocation = DEFAULT_CENTER,
  onLocationSelect,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef();

  const emitSelection = useCallback(
    (coords, place) => {
      if (!onLocationSelect) return;
      const address = place?.display_name || "";
      const addressParts = place?.address || {};
      onLocationSelect({
        coordinates: coords,
        address,
        city: addressParts.city || addressParts.town || addressParts.village || "",
        state: addressParts.state || "",
        country: addressParts.country || "",
      });
    },
    [onLocationSelect]
  );

  const placeMarker = useCallback((lng, lat) => {
    if (!mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: "#ff4d4f" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, []);

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const resp = await fetch(NOMINATIM_REVERSE(lat, lng), {
          headers: { "User-Agent": "eventra-map-picker" },
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        return data;
      } catch (err) {
        console.error("Reverse geocode failed", err);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 11,
    });

    mapRef.current = map;
    placeMarker(initialLocation.lng, initialLocation.lat);

    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      placeMarker(lng, lat);
      const place = await reverseGeocode(lat, lng);
      emitSelection({ lat, lng }, place);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [emitSelection, initialLocation.lat, initialLocation.lng, placeMarker, reverseGeocode]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetch(NOMINATIM_SEARCH(query), {
          headers: { "User-Agent": "eventra-map-picker" },
        });
        if (resp.ok) {
          const data = await resp.json();
          setResults(data || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE);
  }, [query]);

  const handleResultClick = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng) && mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
      placeMarker(lng, lat);
      emitSelection({ lat, lng }, r);
      setResults([]);
      setQuery(r.display_name || "");
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
        Pick location (search or click on map)
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search address or place"
        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
      />
      {isSearching && <div style={{ fontSize: 12, marginTop: 4 }}>Searching…</div>}
      {results.length > 0 && (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 6,
            marginTop: 6,
            maxHeight: 200,
            overflowY: "auto",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            background: "#fff",
            zIndex: 10,
            position: "relative",
          }}
        >
          {results.map((r, idx) => (
            <div
              key={`${r.place_id}-${idx}`}
              onClick={() => handleResultClick(r)}
              style={{ padding: 10, cursor: "pointer", borderBottom: "1px solid #f2f2f2" }}
            >
              <div style={{ fontWeight: 600 }}>{r.display_name}</div>
              {r.type && <div style={{ fontSize: 12, color: "#666" }}>{r.type}</div>}
            </div>
          ))}
        </div>
      )}
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: 360, borderRadius: 8, marginTop: 10, border: "1px solid #eee" }}
      />
    </div>
  );
}

export default MapLocationPicker;
