import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; // Đã mở comment dòng này để kích hoạt routing machine
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { realtimeService } from "../main";
import { useEffect } from 'react';

// Khai báo mở rộng module cho leaflet-routing-machine trong TypeScript
declare module "leaflet" {
    namespace Routing {
        function control(options: any): any;
        function osrmv1(options?: any): any;
    }
}

// Icon tùy chỉnh cho tài xế với emoji xe máy 🛵
const riderIcon = new L.DivIcon({
    html: '<div style="background-color: #3b82f6; width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 18px;">🛵</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: "",
});

// Icon tùy chỉnh cho điểm giao hàng với emoji định vị 📍
const deliveryIcon = new L.DivIcon({
    html: '<div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 18px;">📍</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: "",
});


// Component con chịu trách nhiệm vẽ đường đi (Routing Machine) trên bản đồ
const Routing = ({ from, to }: { from: [number, number]; to: [number, number] }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !from || !to) return;

        const control = L.Routing.control({
            waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
            lineOptions: {
                styles: [{ color: "#E23744", weight: 5 }],
            },
            addWaypoints: false,
            draggableWaypoints: false,
            show: false,
            createMarker: () => null,
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1"
            })
        }).addTo(map);

        return () => {
            if (map && control) {
                map.removeControl(control);
            }
        };
    }, [from, to, map]);

    return null;
};

interface props {
    riderLocation: [number, number] | null;
    deliveryLocation: [number, number];
}

const UserOrderMap = ({ riderLocation, deliveryLocation }: props) => {
    // Thêm điều kiện kiểm tra này để TypeScript hiểu rằng riderLocation chắc chắn không phải null ở bên dưới
    if (!riderLocation) {
        return (
            <div className="rounded-xl bg-white shadow-sm p-4 text-center text-gray-500">
                Loading the Rider...
            </div>
        );
    }

    return (
        <div className='rounded-xl bg-white shadow-sm p-3'>
            <MapContainer center={riderLocation} zoom={14}
                className="h-[350px] w-full rounded-lg"> {/* Sửa lại cú pháp class chiều cao cho chuẩn Tailwind */}
                <TileLayer attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Marker position={riderLocation} icon={riderIcon}>
                    <Popup>
                        Rider 🛵
                    </Popup>
                </Marker>

                <Marker position={deliveryLocation} icon={deliveryIcon}>
                    <Popup>
                        Delivery Location 📍
                    </Popup>
                </Marker>

                <Routing from={riderLocation} to={deliveryLocation} />
            </MapContainer>
        </div>
    );
}

export default UserOrderMap;