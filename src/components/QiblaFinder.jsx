import React, { useState, useEffect } from 'react';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react';

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

  // ขอข้อมูลเข็มทิศ
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

  // คำนวณความแตกต่างระหว่างทิศกิบลัตและทิศทางที่มือถือหันหน้าไป
  const calculateRotationDirection = (qiblaDirection, compass) => {
    const difference = (qiblaDirection - compass + 360) % 360;
    return difference > 180 ? difference - 360 : difference;
  };

  const rotationDifference = qiblaDirection && compass ? calculateRotationDirection(qiblaDirection, compass) : null;

  // กำหนดสีพื้นหลังตามความถูกต้องของทิศทาง
  const getBackgroundColor = () => {
    if (rotationDifference === null) return 'bg-gradient-to-br from-blue-50 to-purple-100';
    const absDifference = Math.abs(rotationDifference);
    if (absDifference <= 10) return 'bg-green-100'; // ถูกต้อง (สีเขียวพาสเทล)
    if (absDifference <= 45) return 'bg-yellow-100'; // ใกล้ถูกต้อง (สีเหลืองพาสเทล)
    return 'bg-red-100'; // ผิดด้าน (สีแดงพาสเทล)
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${getBackgroundColor()}`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-105">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Qibla Finder</h1>

        {error ? (
          <div className="text-red-500 text-center mb-4">{error}</div>
        ) : location ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">ละติจูด: {location.latitude.toFixed(4)}°</p>
              <p className="text-gray-600">ลองจิจูด: {location.longitude.toFixed(4)}°</p>
              {qiblaDirection && (
                <p className="font-bold text-xl text-purple-600 mt-2">ทิศกิบลัต: {qiblaDirection.toFixed(1)}°</p>
              )}
            </div>

            <div className="relative w-64 h-64 mx-auto">
              {/* เข็มทิศพื้นหลัง */}
              <div className="absolute inset-0">
                <Compass size={256} className="text-gray-300" />
              </div>

              {/* ลูกศรชี้ทิศกิบลัต */}
              {qiblaDirection && (
                <div
                  className="absolute inset-0 transition-transform duration-200"
                  style={{ transform: `rotate(${qiblaDirection}deg)` }}
                >
                  <div className="w-2 h-32 bg-gradient-to-b from-purple-600 to-purple-400 mx-auto transform origin-bottom rounded-full shadow-lg" />
                </div>
              )}
            </div>

            {/* แสดงทิศทางที่ต้องหมุน */}
            {rotationDifference !== null && (
              <div className="text-center mt-6">
                <p className="font-bold text-lg text-gray-700">
                  หมุนไปทาง{' '}
                  <span className="text-purple-600">
                    {Math.abs(rotationDifference).toFixed(1)}° {rotationDifference > 0 ? 'ขวา' : 'ซ้าย'}
                  </span>
                </p>
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
          <div className="text-center text-gray-600">กำลังค้นหาตำแหน่ง...</div>
        )}
      </div>
    </div>
  );
};

export default QiblaFinder;