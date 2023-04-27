import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useState, useEffect, memo } from "react";
import { LoadingOverlay, ActionIcon, Tooltip } from "@mantine/core";
import { MapPin, FocusCentered } from "tabler-icons-react";

function LocationMap({ data, dark }) {
  const initialViewState = {
    latitude: 37.0902,
    longitude: -95.7129,
    zoom: 0.25,
    bearing: 0,
    pitch: 0,
  };
  const [viewState, setViewState] = useState(initialViewState);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const isResetDisabled =
    (viewState.latitude === initialViewState.latitude &&
      viewState.longitude === initialViewState.longitude) ||
    isMapMoving;
  const [mapStyle, setMapStyle] = useState(
    dark
      ? "mapbox://styles/mapbox/dark-v10"
      : "mapbox://styles/mapbox/light-v10"
  );

  useEffect(() => {
    setMapStyle(
      dark
        ? "mapbox://styles/mapbox/dark-v10"
        : "mapbox://styles/mapbox/light-v10"
    );
  }, [dark]);

  return (
    <>
      <LoadingOverlay visible={isMapLoading} overlayBlur={2} />
      <ReactMapGL
        onLoad={() => setIsMapLoading(false)}
        mapStyle={mapStyle}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        onMove={(evt) => {
          setIsMapMoving(true);
          setViewState(evt.viewState);
        }}
        onIdle={() => setIsMapMoving(false)}
        {...viewState}
      >
        <ActionIcon
          style={{
            position: "absolute",
            top: "5px",
            left: "5px",
            zIndex: 1,
          }}
          variant="default"
          onClick={() => setViewState(initialViewState)}
          disabled={isResetDisabled}
        >
          <Tooltip
            label="Reset"
            withArrow
            style={{
              backgroundColor: dark ? "#2c2e33" : "#ffffff",
            }}
            disabled={isResetDisabled}
          >
            <FocusCentered
              color={
                isResetDisabled ? "rgba(34,139,230,0.25)" : "rgba(34,139,230,1)"
              }
            />
          </Tooltip>
        </ActionIcon>

        {data
          .filter(({ latLong }) => latLong !== "null, null")
          .map(({ location, latLong, visitors }) => {
            const [lat, long] = latLong.split(", ");
            return (
              <Marker
                key={latLong}
                latitude={lat}
                longitude={long}
                anchor="bottom"
              >
                <MapPin
                  onMouseEnter={() =>
                    setPopupInfo({ location, lat, long, visitors })
                  }
                  onMouseLeave={() => setPopupInfo(null)}
                  color="rgba(34,139,230,.85)"
                />
              </Marker>
            );
          })}
        {popupInfo && (
          <Popup
            anchor="top"
            latitude={Number(popupInfo.lat)}
            longitude={Number(popupInfo.long)}
            onClose={() => setPopupInfo(null)}
            closeOnMove
          >
            <div
              style={{
                color: "#000",
              }}
            >
              {popupInfo.location} <br /> {popupInfo.visitors} view
              {popupInfo.visitors > 1 ? "s" : ""}
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </>
  );
}

export default memo(LocationMap);
