import React, { useState, useEffect } from 'react';
import { Compass, Navigation, MapPin, Moon, Sun, Info } from 'lucide-react';

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [compass, setCompass] = useState(0);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Qibla calculation logic remains the same
  const calculateQiblaDirection = (lat, lng) => {
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    const phi1 = (lat * Math.PI) / 180;
    const phi2 = (kaabaLat * Math.PI) / 180;
    const lambda1 = (lng * Math.PI) / 180;
    const lambda2 = (kaabaLng * Math.PI) / 180;
    const y = Math.sin(lambda2 - lambda1);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lambda2 - lambda1);
    let qibla = Math.atan2(y, x);
    qibla = (qibla * 180) / Math.PI;
    return (qibla + 360) % 360;
  };

  // Location and compass effects remain the same
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError('ไม่สามารถรับตำแหน่งได้ กรุณาเปิดการใช้งาน GPS');
        }
      );
    } else {
      setError('เบราว์เซอร์ของคุณไม่รองรับ Geolocation');
    }
  }, []);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.webkitCompassHeading) {
        setCompass(event.webkitCompassHeading);
      } else if (event.alpha) {
        setCompass(360 - event.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const qiblaDirection = location ? calculateQiblaDirection(location.latitude, location.longitude) : null;
  const rotationDifference = qiblaDirection && compass ? (qiblaDirection - compass + 360) % 360 : null;

  const getStatusColor = () => {
    if (!rotationDifference) return 'from-blue-500 to-purple-600';
    const diff = Math.abs(rotationDifference);
    if (diff <= 2) return 'from-green-500 to-emerald-600';
    if (diff <= 45) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Floating Action Buttons */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-3 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-all shadow-lg"
        >
          <Info className="w-6 h-6" />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-all shadow-lg"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Qibla Finder
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ค้นหาทิศกิบลัตจากตำแหน่งของคุณ
            </p>
          </div>

          {error ? (
            <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-4 border border-red-500/20">
              <div className="flex items-center text-red-500">
                <MapPin className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          ) : !location ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">กำลังค้นหาตำแหน่ง...</p>
            </div>
          ) : (
            <>
              {/* Coordinates Display */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl backdrop-blur-lg border border-gray-200/20`}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ละติจูด</p>
                    <p className="text-2xl font-semibold mt-1">{location.latitude.toFixed(4)}°</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ลองจิจูด</p>
                    <p className="text-2xl font-semibold mt-1">{location.longitude.toFixed(4)}°</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200/20 text-center">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ทิศกิบลัต</p>
                  <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {qiblaDirection?.toFixed(1)}°
                  </p>
                </div>
              </div>

              {/* Compass Display */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-xl backdrop-blur-lg border border-gray-200/20`}>
                <div className="relative aspect-square">
                  {/* Background Compass */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Compass className="w-full h-full" />
                  </div>

                  {/* Direction Indicator */}
                  <div
                    className="absolute inset-0 transition-transform duration-1000"
                    style={{ transform: `rotate(${qiblaDirection}deg)` }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full origin-bottom" />
                  </div>

                  {/* Center Point */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600" />
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              {rotationDifference !== null && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl backdrop-blur-lg border border-gray-200/20`}>
                  <div className="text-center space-y-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor()} text-white`}>
                      <Navigation className="w-5 h-5 mr-2" />
                      <span>
                        {Math.abs(rotationDifference).toFixed(1)}° 
                        {rotationDifference > 0 ? ' ขวา' : ' ซ้าย'}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {Math.abs(rotationDifference) <= 2 ? 'แม่นยำ' :
                       Math.abs(rotationDifference) <= 45 ? 'ใกล้เคียง' : 'ไม่ถูกต้อง'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 m-4 max-w-lg shadow-2xl`}>
            <h2 className="text-2xl font-bold mb-4">วิธีใช้งาน Qibla Finder</h2>
            <div className="space-y-4">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                1. อนุญาตให้เข้าถึงตำแหน่งของคุณเมื่อได้รับแจ้ง
              </p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                2. ถือโทรศัพท์ในแนวระนาบและหมุนไปตามทิศทางที่ลูกศรชี้
              </p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                3. สีจะเปลี่ยนเป็นสีเขียวเมื่อคุณหันไปในทิศที่ถูกต้อง
              </p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QiblaFinder;