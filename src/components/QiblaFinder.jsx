import React, { useState, useEffect } from 'react';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react';

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [compass, setCompass] = useState(0);
  const [error, setError] = useState(null);

  // ฟังก์ชันคำนวณทิศกิบลัต
  const calculateQiblaDirection = (lat, lng) => {
    // พิกัดของกะอฺบะฮฺ (มักกะฮฺ)
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    // แปลงองศาเป็นเรเดียน
    const phi1 = (lat * Math.PI) / 180;
    const phi2 = (kaabaLat * Math.PI) / 180;
    const lambda1 = (lng * Math.PI) / 180;
    const lambda2 = (kaabaLng * Math.PI) / 180;

    // คำนวณทิศทาง
    const y = Math.sin(lambda2 - lambda1);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lambda2 - lambda1);
    let qibla = Math.atan2(y, x);

    // แปลงกลับเป็นองศา
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
        // สำหรับ iOS
        setCompass(event.webkitCompassHeading);
      } else if (event.alpha) {
        // สำหรับ Android
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">ค้นหาทิศกิบลัต</h1>

        {error ? (
          <div className="text-red-500 text-center mb-4">{error}</div>
        ) : location ? (
          <div className="space-y-4">
            <div className="text-center">
              <p>ละติจูด: {location.latitude.toFixed(4)}°</p>
              <p>ลองจิจูด: {location.longitude.toFixed(4)}°</p>
              {qiblaDirection && (
                <p className="font-bold mt-2">ทิศกิบลัต: {qiblaDirection.toFixed(1)}°</p>
              )}
            </div>

            <div className="relative w-48 h-48 mx-auto">
              {/* เข็มทิศพื้นหลัง */}
              <div className="absolute inset-0">
                <Compass size={192} className="text-gray-400" />
              </div>

              {/* ลูกศรชี้ทิศกิบลัต */}
              {qiblaDirection && (
                <div
                  className="absolute inset-0 transition-transform duration-200"
                  style={{ transform: `rotate(${qiblaDirection}deg)` }}
                >
                  <div className="w-1 h-24 bg-green-500 mx-auto transform origin-bottom" />
                </div>
              )}
            </div>

            {/* แสดงทิศทางที่ต้องหมุน */}
            {rotationDifference !== null && (
              <div className="text-center mt-4">
                <p className="font-bold">
                  {Math.abs(rotationDifference).toFixed(1)}° ไปทาง{' '}
                  {rotationDifference > 0 ? 'ขวา' : 'ซ้าย'}
                </p>
                <div className="flex justify-center mt-2">
                  {rotationDifference > 0 ? (
                    <ArrowRight className="text-green-500" size={32} />
                  ) : (
                    <ArrowLeft className="text-green-500" size={32} />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">กำลังค้นหาตำแหน่ง...</div>
        )}
      </div>
    </div>
  );
};

export default QiblaFinder;