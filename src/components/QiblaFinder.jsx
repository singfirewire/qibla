import React, { useState, useEffect } from 'react';
import { Compass, Navigation, MapPin, Settings, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QiblaFinder = () => {
  const [location, setLocation] = useState(null);
  const [compass, setCompass] = useState(0);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const { theme, setTheme } = useTheme();

  // Original calculation functions remain the same
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
    if (rotationDifference === null) return 'bg-gradient-to-br from-blue-50 to-purple-100 dark:from-slate-900 dark:to-slate-800';
    const absDifference = Math.abs(rotationDifference);
    if (absDifference <= 2) return 'bg-green-100 dark:bg-green-900';
    if (absDifference <= 45) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const DirectionIndicator = () => {
    if (rotationDifference === null) return null;
    const accuracy = Math.abs(rotationDifference) <= 2 ? 'แม่นยำ' : 
                    Math.abs(rotationDifference) <= 45 ? 'ใกล้เคียง' : 'ไม่ถูกต้อง';
    const color = Math.abs(rotationDifference) <= 2 ? 'text-green-600 dark:text-green-400' : 
                 Math.abs(rotationDifference) <= 45 ? 'text-yellow-600 dark:text-yellow-400' : 
                 'text-red-600 dark:text-red-400';

    return (
      <div className="text-center mt-8">
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${color} bg-opacity-20`}>
          <Navigation className="mr-2" size={20} />
          <span className="font-medium">{accuracy}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()} transition-colors duration-500`}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Qibla Finder
          </h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                {error}
              </AlertDescription>
            </Alert>
          ) : location ? (
            <div className="space-y-6">
              {/* Location Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">ละติจูด</p>
                      <p className="text-2xl font-bold mt-1">{location.latitude.toFixed(4)}°</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ลองจิจูด</p>
                      <p className="text-2xl font-bold mt-1">{location.longitude.toFixed(4)}°</p>
                    </div>
                  </div>
                  {qiblaDirection && (
                    <div className="mt-6 text-center border-t pt-6">
                      <p className="text-sm text-muted-foreground">ทิศกิบลัต</p>
                      <p className="text-4xl font-bold text-primary mt-1">{qiblaDirection.toFixed(1)}°</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Compass Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="relative aspect-square max-w-md mx-auto">
                    {/* Background Compass */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Compass 
                        size={300}
                        className="text-muted-foreground/20 animate-pulse"
                      />
                    </div>

                    {/* Qibla Direction Arrow */}
                    {qiblaDirection && (
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-in-out"
                        style={{ transform: `rotate(${qiblaDirection}deg)` }}
                      >
                        <div className="w-1 h-40 bg-gradient-to-b from-primary to-primary/50 rounded-full shadow-lg" />
                      </div>
                    )}

                    {/* Center Point */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-primary shadow-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Direction Indicator */}
              <DirectionIndicator />

              {/* Rotation Instructions */}
              {rotationDifference !== null && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-lg">
                      หมุนไปทาง{' '}
                      <span className="font-bold text-primary">
                        {Math.abs(rotationDifference).toFixed(1)}°
                        {rotationDifference > 0 ? ' ขวา' : ' ซ้าย'}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                  <p className="mt-4 text-muted-foreground">กำลังค้นหาตำแหน่ง...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Modal */}
          {showInfo && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="w-full max-w-lg mx-4">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">เกี่ยวกับ Qibla Finder</h2>
                  <p className="text-muted-foreground mb-4">
                    Qibla Finder ช่วยคุณค้นหาทิศกิบลัตจากตำแหน่งปัจจุบันของคุณ 
                    โดยใช้ GPS และเข็มทิศของอุปกรณ์เพื่อระบุทิศทางที่ถูกต้อง
                  </p>
                  <p className="text-muted-foreground mb-4">
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
                  <Button className="w-full" onClick={() => setShowInfo(false)}>
                    ปิด
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QiblaFinder;