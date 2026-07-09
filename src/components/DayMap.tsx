import { useEffect, useRef } from 'react';
import L from 'leaflet';
import '../leafletSetup';
import type { Activity } from '../types';
import { PinIcon } from './Icons';

type Props = {
  activities: Activity[];
  onActivityMove: (id: string, lat: number, lng: number) => void;
};

export default function DayMap({ activities, onActivityMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const meMarkerRef = useRef<L.CircleMarker | null>(null);
  const onActivityMoveRef = useRef(onActivityMove);
  onActivityMoveRef.current = onActivityMove;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([35.681236, 139.767125], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      meMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const located = activities.filter(
      (a): a is Activity & { lat: number; lng: number } => a.lat != null && a.lng != null,
    );

    located.forEach((a, i) => {
      const marker = L.marker([a.lat, a.lng], { draggable: true }).bindPopup(
        `${i + 1}. ${a.title || '이름 없음'}`,
      );
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onActivityMoveRef.current(a.id, pos.lat, pos.lng);
      });
      marker.addTo(layer);
    });

    if (located.length > 1) {
      L.polyline(
        located.map((a) => [a.lat, a.lng] as [number, number]),
        { color: '#6366f1', weight: 3, opacity: 0.7 },
      ).addTo(layer);
    }

    if (located.length > 0) {
      const bounds = L.latLngBounds(located.map((a) => [a.lat, a.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    }
  }, [activities]);

  const showMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const map = mapRef.current;
      if (!map) return;
      const { latitude, longitude } = pos.coords;
      if (meMarkerRef.current) {
        meMarkerRef.current.setLatLng([latitude, longitude]);
      } else {
        meMarkerRef.current = L.circleMarker([latitude, longitude], {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: '#2563eb',
          fillOpacity: 1,
        })
          .bindPopup('내 위치')
          .addTo(map);
      }
      map.flyTo([latitude, longitude], 15);
    });
  };

  const hasLocated = activities.some((a) => a.lat != null && a.lng != null);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-56 w-full" />
      <button
        onClick={showMyLocation}
        className="absolute bottom-2 right-2 z-[1000] inline-flex items-center gap-1 bg-white dark:bg-[#2C2C2E] shadow rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
      >
        <PinIcon className="h-3.5 w-3.5" />내 위치
      </button>
      {!hasLocated && (
        <p className="absolute inset-0 flex items-center justify-center text-center px-6 text-xs text-gray-400 bg-white/80 dark:bg-black/80 pointer-events-none z-[500]">
          활동의 위치 옆 검색 버튼으로 검색하면 지도에 핀이 표시돼요
        </p>
      )}
    </div>
  );
}
