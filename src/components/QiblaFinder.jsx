import React, { useState, useEffect } from 'react';
import { Compass, ArrowRight, ArrowLeft, MapPin, Navigation } from 'lucide-react';

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [compass, setCompass] = useState(0);
  const [error, setError] = useState(null);

  // ฟังก์ชันคำนวณทิศกิบลัต
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

  const calculateRotationDirection = (qiblaDirection, compass) => {
    const difference = (qiblaDirection - compass + 360) % 360;
    return difference > 180 ? difference - 360 : difference;
  };

  const rotationDifference = qiblaDirection && compass ? calculateRotationDirection(qiblaDirection, compass) : null;

  const getBackgroundColor = () => {
    if (rotationDifference === null) return 'bg-gradient-to-br from-blue-50 to-purple-100';
    const absDifference = Math.abs(rotationDifference);
    if (absDifference <= 2) return 'bg-green-100';
    if (absDifference <= 45) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${getBackgroundColor()} transition-colors duration-500`}>
      {/* Glass-morphism Card */}
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-102 border border-white/20">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Qibla Finder
          </h1>
          <p className="text-gray-500 mt-2">ค้นหาทิศกิบลัตของคุณ</p>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="text-red-500" size={24} />
              </div>
              <div className="ml-3">
                <p className="text-red-500">{error}</p>
              </div>
            </div>
          </div>
        ) : location ? (
          <div className="space-y-8">
            {/* Location Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">ละติจูด</p>
                  <p className="text-lg font-semibold text-gray-700">{location.latitude.toFixed(4)}°</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">ลองจิจูด</p>
                  <p className="text-lg font-semibold text-gray-700">{location.longitude.toFixed(4)}°</p>
                </div>
              </div>
              {qiblaDirection && (
                <div className="text-center mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500">ทิศกิบลัต</p>
                  <p className="text-2xl font-bold text-purple-600">{qiblaDirection.toFixed(1)}°</p>
                </div>
              )}
            </div>

            {/* Compass Section */}
            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 transition-transform duration-500">
                <Compass size={256} className="text-gray-300" />
              </div>

              {qiblaDirection && (
                <div
                  className="absolute inset-0 transition-transform duration-500 ease-in-out"
                  style={{ transform: `rotate(${qiblaDirection}deg)` }}
                >
                  <div className="w-2 h-32 bg-gradient-to-b from-purple-600 to-blue-600 mx-auto transform origin-bottom rounded-full shadow-lg" />
                </div>
              )}
            </div>

            {/* Direction Instructions */}
            {rotationDifference !== null && (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <Navigation className="text-purple-600" size={24} />
                  <p className="font-bold text-lg text-gray-700">
                    หมุนไปทาง{' '}
                    <span className="text-purple-600">
                      {Math.abs(rotationDifference).toFixed(1)}° {rotationDifference > 0 ? 'ขวา' : 'ซ้าย'}
                    </span>
                  </p>
                </div>
                <div className="flex justify-center mt-4">
                  {rotationDifference > 0 ? (
                    <ArrowRight className="text-purple-600 animate-bounce" size={40} />
                  ) : (
                    <ArrowLeft className="text-purple-600 animate-bounce" size={40} />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังค้นหาตำแหน่ง...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QiblaFinder;