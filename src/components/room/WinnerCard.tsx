import { QRCodeSVG } from 'qrcode.react';

interface Restaurant {
  id: string;
  name: string;
  emoji: string;
  foodType: string;
  price: string;
  walkTime: string;
  description: string;
  googleMapsUrl: string;
  menuUrl: string;
}

interface WinnerCardProps {
  restaurant: Restaurant;
}

export default function WinnerCard({ restaurant }: WinnerCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-6 w-full max-w-sm text-black text-center">
      <h2 className="text-base font-semibold mb-1">🥁 Et le gagnant est...</h2>
      <h3 className="text-3xl md:text-4xl font-extrabold my-2">{restaurant.name}</h3>
      <span className="text-6xl my-3 inline-block" role="img">{restaurant.emoji}</span>
      <p className="text-base md:text-lg font-medium text-gray-700 mb-4">{restaurant.foodType}</p>
      <div className="hidden lg:flex flex-col items-center gap-4 mt-6 pt-6 border-t border-black/10">
        <h4 className="font-semibold text-sm">Scanne pour y aller</h4>
        <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/10 p-3 shadow">
          <QRCodeSVG value={restaurant.googleMapsUrl} size={128} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} />
        </div>
      </div>
      <div className="lg:hidden flex justify-center gap-4 font-semibold mt-4">
        <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-4 py-2 hover:bg-white transition-colors cursor-pointer shadow">📍 Ouvrir l’itinéraire</a>
      </div>
    </div>
  );
}
