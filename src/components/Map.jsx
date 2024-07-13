import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useCities } from "../contexts/CitiesContext";
import styles from "./Map.module.css";

function Map() {
	// const navigate = useNavigate();

	const { cities } = useCities();
	const [mapPosition, setMapPosition] = useState([40, 0]);
	const [searchParams, setSearchParams] = useSearchParams();
	// const lat = searchParams.get("lat");
	// const lng = searchParams.get("lng");

	return (
		<div className={styles.mapContainer}>
			{(setMapPosition, searchParams, setSearchParams)}
			<MapContainer
				center={mapPosition}
				zoom={13}
				scrollWheelZoom={true}
				className={styles.map}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
				/>
				{cities.map((city) => (
					<Marker
						position={[city.position.lat, city.position.lng]}
						key={city.id}
					>
						<Popup>
							<span>{city.emoji}</span>
							<spn>{city.cityName}</spn>
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
}

export default Map;
