import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';

export default function MotionSensorDemo() {
  const [accel, setAccel] = useState({ x:0, y:0, z:0 });
  const [gyro, setGyro]   = useState({ x:0, y:0, z:0 });
  const [shakeCount, setShakeCount] = useState(0);
  const accelSub = useRef<any>(null);

  const SHAKE_THRESHOLD = 1.7;

  useEffect(() => {
    // Accelerometer
    Accelerometer.setUpdateInterval(100);
    accelSub.current = Accelerometer.addListener(data => {
      setAccel(data);
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x*x + y*y + z*z);
      if (magnitude > SHAKE_THRESHOLD) {
        setShakeCount(prev => prev + 1);
      }
    });

    // Gyroscope
    Gyroscope.setUpdateInterval(200);
    const gyroSub = Gyroscope.addListener(data => {
      setGyro(data);
    });

    return () => {
      accelSub.current && accelSub.current.remove();
      gyroSub.remove();
    };
  }, []);

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:20 }}>
      <Text>Acceleration x:{accel.x.toFixed(2)} y:{accel.y.toFixed(2)} z:{accel.z.toFixed(2)}</Text>
      <Text>Gyroscope x:{gyro.x.toFixed(2)} y:{gyro.y.toFixed(2)} z:{gyro.z.toFixed(2)}</Text>
      <Text>Shake count: {shakeCount}</Text>
    </View>
  );
}