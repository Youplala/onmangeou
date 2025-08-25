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
    <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-sm text-black text-center">
      <h2 className="text-xl font-black mb-2">🎉 LE GAGNANT EST... 🎉</h2>
      <h3 className="text-4xl font-black my-2">{restaurant.name}</h3>
      <span className="text-6xl my-4 inline-block" role="img">{restaurant.emoji}</span>
      <p className="text-lg font-bold text-gray-500 mb-4">{restaurant.foodType}</p>
      <div className="hidden lg:flex flex-col items-center gap-4 mt-6 pt-6 border-t-4 border-dashed border-black">
        <h4 className="font-black text-lg">Scanner pour y aller :</h4>
        <div className="bg-white p-2 border-4 border-black">
          <QRCodeSVG value={restaurant.googleMapsUrl} size={128} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} />
        </div>
      </div>
      <div className="lg:hidden flex justify-center gap-4 font-bold mt-4">
        <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="bg-white border-2 border-black px-4 py-2 hover:bg-gray-100 transition-colors">📍 Maps</a>
      </div>
    </div>
  );
}
