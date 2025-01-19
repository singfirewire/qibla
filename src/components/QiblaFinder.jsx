import React, { useState, useEffect } from 'react';
import { Compass, Navigation, MapPin, Settings, Info, Moon, Sun } from 'lucide-react';

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [compass, setCompass] = useState(0);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // คำนวณทิศกิบลัต
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

  // ขอตำแหน่งปัจจุบัน
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

  // จัดการเข็มทิศ
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

  const calculateRotationDirection = (qiblaDirection, compass) => {
    const difference = (qiblaDirection - compass + 360) % 360;
    return difference > 180 ? difference - 360 : difference;
  };

  const rotationDifference = qiblaDirection && compass ? calculateRotationDirection(qiblaDirection, compass) : null;

  const getBackgroundColor = () => {
    if (rotationDifference === null) 
      return darkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-purple-100';
    const absDifference = Math.abs(rotationDifference);
    if (absDifference <= 2) 
      return darkMode ? 'bg-green-900' : 'bg-green-100';
    if (absDifference <= 45) 
      return darkMode ? 'bg-yellow-900' : 'bg-yellow-100';
    return darkMode ? 'bg-red-900' : 'bg-red-100';
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()} transition-colors duration-500`}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-lg border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} z-50`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Qibla Finder
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${darkMode ? 'text-white' : 'text-gray-700'}`}
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${darkMode ? 'text-white' : 'text-gray-700'}`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          {error ? (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} border-l-4 border-red-500 mb-4`}>
              <div className="flex items-center">
                <MapPin className="text-red-500 mr-2" />
                <p className={`${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
              </div>
            </div>
          ) : location ? (
            <div className="space-y-6">
              {/* Location Card */}
              <div className={`rounded-2xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6`}>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>ละติจูด</p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {location.latitude.toFixed(4)}°
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>ลองจิจูด</p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {location.longitude.toFixed(4)}°
                    </p>
                  </div>
                </div>
                {qiblaDirection && (
                  <div className="mt-6 text-center border-t pt-6 border-gray-200 dark:border-slate-700">
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>ทิศกิบลัต</p>
                    <p className="text-4xl font-bold text-purple-600 mt-1">
                      {qiblaDirection.toFixed(1)}°
                    </p>
                  </div>
                )}
              </div>

              {/* Compass Card */}
              <div className={`rounded-2xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6`}>
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Compass 
                      size={300}
                      className={`${darkMode ? 'text-slate-700' : 'text-gray-200'} animate-pulse`}
                    />
                  </div>

                  {qiblaDirection && (
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-in-out"
                      style={{ transform: `rotate(${qiblaDirection}deg)` }}
                    >
                      <div className="w-1 h-40 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full shadow-lg" />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-purple-600 shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Direction Instructions */}
              {rotationDifference !== null && (
                <div className={`rounded-2xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 text-center`}>
                  <div className="flex items-center justify-center space-x-2">
                    <Navigation className="text-purple-600" size={24} />
                    <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      หมุนไปทาง{' '}
                      <span className="font-bold text-purple-600">
                        {Math.abs(rotationDifference).toFixed(1)}°
                        {rotationDifference > 0 ? ' ขวา' : ' ซ้าย'}
                      </span>
                    </p>
                  </div>
                  <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full ${
                    Math.abs(rotationDifference) <= 2
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : Math.abs(rotationDifference) <= 45
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {Math.abs(rotationDifference) <= 2 ? 'แม่นยำ' : 
                     Math.abs(rotationDifference) <= 45 ? 'ใกล้เคียง' : 'ไม่ถูกต้อง'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`rounded-2xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6`}>
              <div className="flex flex-col items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
                <p className={`mt-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  กำลังค้นหาตำแหน่ง...
                </p>
              </div>
            </div>
          )}

          {/* Info Modal */}
          {showInfo && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className={`w-full max-w-lg mx-4 rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  เกี่ยวกับ Qibla Finder
                </h2>
                <p className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Qibla Finder ช่วยคุณค้นหาทิศกิบลัตจากตำแหน่งปัจจุบันของคุณ 
                  โดยใช้ GPS และเข็มทิศของอุปกรณ์เพื่อระบุทิศทางที่ถูกต้อง
                </p>
                <p className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  สีของหน้าจอจะเปลี่ยนไปตามความแม่นยำของทิศทาง:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <div className="w-3 h-3 rounded-full bg-green-600 dark:bg-green-400 mr-2" />
                    แม่นยำ (±2°)
                  </li>
                  <li className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <div className="w-3 h-3 rounded-full bg-yellow-600 dark:bg-yellow-400 mr-2" />
                    ใกล้เคียง (±45°)
                  </li>
                  <li className="flex items-center text-red-600 dark:text-red-400">
                    <div className="w-3 h-3 rounded-full bg-red-600 dark:bg-red-400 mr-2" />
                    ไม่ถูกต้อง (>45°)
                  </li>
                </ul>
                <button
                  onClick={() => setShowInfo(false)}
                  className={`w-full py-2 rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  } transition-colors`}
                >
                  ปิด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QiblaFinder;